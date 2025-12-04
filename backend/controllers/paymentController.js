const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const wompiService = require('../services/wompiService');

// POST /api/payments/create-transaction
async function createTransaction(req, res) {
  try {
    const { courseId, amount } = req.body;
    const userId = req.user && req.user.id;
    const course = await Course.findById(courseId);
    if (!course || !course.isPaidCourse) return res.status(400).json({ message: 'Curso inválido o no es de pago' });
    const student = await User.findById(userId);

    const metadata = { courseId, studentEmail: student.email, reference: `course_${courseId}_user_${userId}` };
    const { checkoutUrl, wompiTransactionId } = await wompiService.createTransaction({ amount, currency: course.currency || 'COP', metadata });

    // Crear registro pendiente en la BD
    const payment = await Payment.create({
      student: userId,
      course: courseId,
      amount,
      currency: course.currency || 'COP',
      status: 'pending',
      paymentMethod: 'wompi',
      wompiTransactionId,
      metadata
    });

    return res.json({ checkoutUrl, wompiTransactionId, paymentId: payment._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creando transacción', error: err.message });
  }
}

// POST /api/payments/confirm
async function confirmPayment(req, res) {
  try {
    const { wompiTransactionId } = req.body;
    if (!wompiTransactionId) return res.status(400).json({ message: 'Missing wompiTransactionId' });

    const wompiData = await wompiService.verifyTransaction(wompiTransactionId);
    // Buscar payment pendiente
    const payment = await Payment.findOne({ wompiTransactionId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (wompiData.status === 'APPROVED' || wompiData.status === 'successful' || wompiData.status === 'PAID') {
      // calcular distribución
      const { wompiFee, platformFee, teacherAmount } = wompiService.calculateFeeDistribution(payment.amount);
      payment.status = 'completed';
      payment.paymentDate = new Date();
      payment.wompiFee = wompiFee;
      payment.platformFee = platformFee;
      payment.teacherAmount = teacherAmount;
      payment.transactionId = wompiData.id || wompiTransactionId;
      await payment.save();

      // agregar estudiante al curso (si el modelo Course tiene enroll)
      const course = await Course.findById(payment.course);
      if (course) {
        // ejemplo: course.students.push(payment.student) y save
        if (!course.students) course.students = [];
        if (!course.students.includes(payment.student)) {
          course.students.push(payment.student);
          await course.save();
        }
      }

      // actualizar ganancias del docente (si aplica)
      const teacher = await User.findById(course.teacher);
      if (teacher) {
        teacher.totalEarnings = (teacher.totalEarnings || 0) + teacherAmount;
        await teacher.save();
      }

      return res.json({ success: true, payment });
    }

    // estados no aprobados
    payment.status = 'failed';
    await payment.save();
    return res.json({ success: false, status: wompiData.status });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error confirmando pago', error: err.message });
  }
}

// GET /api/payments/user
async function getUserPayments(req, res) {
  const userId = req.user && req.user.id;
  const payments = await Payment.find({ student: userId }).populate('course');
  return res.json(payments);
}

// GET /api/payments/course/:courseId/status
async function checkPaymentStatus(req, res) {
  const userId = req.user && req.user.id;
  const { courseId } = req.params;
  const payment = await Payment.findOne({ student: userId, course: courseId, status: 'completed' });
  return res.json({ hasPaid: !!payment, payment });
}

// GET /api/payments/course/:courseId/stats
async function getCoursePaymentStats(req, res) {
  const { courseId } = req.params;
  const payments = await Payment.find({ course: courseId, status: 'completed' }).populate('student');
  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalPayments = payments.length;
  const totalTeacherEarnings = payments.reduce((s, p) => s + (p.teacherAmount || 0), 0);
  const totalPlatformFees = payments.reduce((s, p) => s + (p.platformFee || 0), 0);
  return res.json({ totalRevenue, totalPayments, totalTeacherEarnings, totalPlatformFees, payments });
}

// POST /api/payments/teacher/payout-account
async function createTeacherPayoutAccount(req, res) {
  try {
    const userId = req.user && req.user.id;
    const { bankName, accountNumber, accountType, documentId } = req.body;

    if (!bankName || !accountNumber || !documentId) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Guardar información de payout (simple: en memoria del user o en una colección aparte)
    user.payoutInfo = {
      bankName,
      accountNumber,
      accountType,
      documentId,
      status: 'pending',
      createdAt: new Date()
    };
    user.teacherPayoutStatus = 'pending';
    await user.save();

    return res.json({ success: true, payoutStatus: 'pending' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error', error: err.message });
  }
}

// GET /api/payments/teacher/balance
async function getTeacherBalance(req, res) {
  try {
    const userId = req.user && req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json({
      totalEarnings: user.totalEarnings || 0,
      monthlyEarnings: user.monthlyEarnings || 0,
      payoutStatus: user.teacherPayoutStatus || 'not_configured'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error', error: err.message });
  }
}

// POST /api/payments/webhook (sin autenticación, verificar con Wompi)
async function handleWompiWebhook(req, res) {
  try {
    const event = req.body;
    // Wompi envía eventos con estructura: { event: { type, data } } o similar
    // Para sandbox/testing: verificar manualmente o asumir confianza temporal
    if (!event || !event.data) return res.status(400).json({ message: 'Invalid webhook' });

    const { id: wompiTransactionId, status, amount_in_cents } = event.data;
    const payment = await Payment.findOne({ wompiTransactionId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Actualizar estado según respuesta de Wompi
    if (status === 'APPROVED' || status === 'successful' || status === 'PAID') {
      const { wompiFee, platformFee, teacherAmount } = wompiService.calculateFeeDistribution(payment.amount);
      payment.status = 'completed';
      payment.paymentDate = new Date();
      payment.wompiFee = wompiFee;
      payment.platformFee = platformFee;
      payment.teacherAmount = teacherAmount;
      payment.transactionId = wompiTransactionId;
      await payment.save();

      // Agregar al curso
      const course = await Course.findById(payment.course);
      if (course && course.students && !course.students.includes(payment.student)) {
        course.students.push(payment.student);
        await course.save();
      }

      // Actualizar ganancias docente
      const teacher = await User.findById(course.teacher);
      if (teacher) {
        teacher.totalEarnings = (teacher.totalEarnings || 0) + teacherAmount;
        await teacher.save();
      }
    } else if (status === 'DECLINED' || status === 'REJECTED') {
      payment.status = 'failed';
      await payment.save();
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ message: 'Webhook error', error: err.message });
  }
}

module.exports = {
  createTransaction,
  confirmPayment,
  getUserPayments,
  checkPaymentStatus,
  getCoursePaymentStats,
  createTeacherPayoutAccount,
  getTeacherBalance,
  handleWompiWebhook
};
