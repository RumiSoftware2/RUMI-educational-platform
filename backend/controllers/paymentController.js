const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const wompiService = require('../services/wompiService');

// Helper: finaliza el pago (idempotente). Valida montos y realiza payout si aplica.
async function finalizePayment(payment, wompiData) {
  // Evitar re-procesar pagos ya completados
  if (!payment) throw new Error('Payment object missing in finalizePayment');
  if (payment.status === 'completed') return payment;

  // Validación de monto: si Wompi reporta amount_in_cents, verificar contra payment.amount
  const wompiCents = Number(wompiData?.amount_in_cents || wompiData?.amount || 0);
  if (wompiCents > 0) {
    const expectedCents = Math.round((payment.amount || 0) * 100);
    if (wompiCents !== expectedCents) {
      // No completar pago si hay discrepancia de montos
      console.warn(`Monto Wompi (${wompiCents}) no coincide con Payment (${expectedCents}) para payment ${payment._id}`);
      payment.status = 'suspect';
      payment.payoutStatus = 'FAILED';
      payment.payoutError = `Monto discrepante: wompi ${wompiCents} vs expected ${expectedCents}`;
      await payment.save();
      throw new Error('Monto de transacción no coincide con monto esperado');
    }
  }

  // calcular distribución
  const { wompiFee, platformFee, teacherAmount } = wompiService.calculateFeeDistribution(payment.amount);
  payment.status = 'completed';
  payment.paymentDate = new Date();
  payment.wompiFee = wompiFee;
  payment.platformFee = platformFee;
  payment.teacherAmount = teacherAmount;
  payment.transactionId = wompiData.id || wompiData.transaction_id || payment.wompiTransactionId;
  await payment.save();

  // agregar estudiante al curso
  const course = await Course.findById(payment.course);
  if (course) {
    if (!course.students) course.students = [];
    if (!course.students.map(s => String(s)).includes(String(payment.student))) {
      course.students.push(payment.student);
      await course.save();
    }
  }

  // actualizar ganancias del docente y crear payout si aplica
  try {
    const teacher = await User.findById(course.teacher);
    if (teacher) {
      teacher.totalEarnings = (teacher.totalEarnings || 0) + teacherAmount;

      if (teacher.payoutInfo && teacher.payoutInfo.accountNumber && teacher.payoutInfo.documentId && teacher.name && teacher.email) {
        try {
          const payoutResult = await wompiService.createPayout({
            amount: teacherAmount,
            currency: payment.currency || 'COP',
            payoutInfo: { ...teacher.payoutInfo, name: teacher.name, email: teacher.email },
            reference: `payment_${payment._id}`
          });
          payment.wompiTransferId = payoutResult.wompiTransferId;
          payment.batchId = payoutResult.batchId;
          payment.payoutStatus = payoutResult.status || 'PENDING';
        } catch (payoutErr) {
          console.error(`Payout failed for teacher ${teacher._id}:`, payoutErr.message);
          payment.payoutStatus = 'FAILED';
          payment.payoutError = payoutErr.message;
        }
      } else {
        payment.payoutStatus = 'NO_PAYOUT_INFO';
      }
      await teacher.save();
    }
  } catch (err) {
    console.error('Error updating teacher earnings/payout:', err.message || err);
  }

  await payment.save();
  return payment;
}

// POST /api/payments/create-transaction
async function createTransaction(req, res) {
  try {
    const { courseId } = req.body;  // ⚠️ NO confiar en amount del cliente
    const userId = req.user && req.user.id;
    
    // Obtener curso para validar que sea de pago y obtener precio real
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    if (!course.isPaidCourse) {
      return res.status(400).json({ message: 'Este no es un curso de pago' });
    }
    
    // ✅ Usar el precio de la BD, no del cliente (seguridad)
    const amount = course.price;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Precio del curso inválido' });
    }
    
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const metadata = { 
      courseId, 
      studentEmail: student.email, 
      reference: `course_${courseId}_user_${userId}`,
      teacherId: course.teacher
    };
    
    const { checkoutUrl, wompiTransactionId } = await wompiService.createTransaction({ 
      amount, 
      currency: 'COP',  // Moneda fija
      metadata 
    });

    // Crear registro pendiente en la BD
    const payment = await Payment.create({
      student: userId,
      course: courseId,
      amount,
      currency: 'COP',
      status: 'pending',
      paymentMethod: 'wompi',
      wompiTransactionId,
      metadata
    });

    return res.json({ 
      checkoutUrl, 
      wompiTransactionId, 
      paymentId: payment._id,
      amount  // Retornar monto para confirmación
    });
  } catch (err) {
    console.error('Error creando transacción:', err);
    return res.status(500).json({ message: 'Error creando transacción', error: err.message });
  }
}

// POST /api/payments/confirm
async function confirmPayment(req, res) {
  try {
    const { wompiTransactionId } = req.body;
    if (!wompiTransactionId) return res.status(400).json({ message: 'Missing wompiTransactionId' });

    // Verificar transacción en Wompi (fuente de verdad) y usar lógica centralizada
    const wompiData = await wompiService.verifyTransaction(wompiTransactionId);
    const payment = await Payment.findOne({ wompiTransactionId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (wompiData.status === 'APPROVED' || wompiData.status === 'successful' || wompiData.status === 'PAID') {
      try {
        const updated = await finalizePayment(payment, wompiData);
        return res.json({ success: true, payment: updated });
      } catch (finalErr) {
        console.error('Error finalizing payment:', finalErr.message || finalErr);
        return res.status(400).json({ success: false, message: finalErr.message });
      }
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

    // Guardar información de payout con activación automática
    user.payoutInfo = {
      bankName,
      accountNumber,
      accountType,
      documentId,
      status: 'active',  // ✅ Activado automáticamente
      createdAt: new Date()
    };
    user.teacherPayoutStatus = 'active';  // ✅ Activado automáticamente
    await user.save();

    return res.json({ success: true, payoutStatus: 'active', message: '✅ Cuenta activada automáticamente' });
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
      payoutStatus: user.teacherPayoutStatus || 'not_configured',
      payoutInfo: user.payoutInfo || null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error', error: err.message });
  }
}

// GET /api/payments/payouts/banks  (admin)
async function getPayoutBanks(req, res) {
  try {
    const banks = await wompiService.fetchBanks();
    if (!banks) return res.status(500).json({ message: 'No se pudo obtener la lista de bancos. Verifica credenciales de payouts.' });
    return res.json(banks);
  } catch (err) {
    console.error('Error fetching payout banks:', err);
    return res.status(500).json({ message: 'Error', error: err.message });
  }
}

// GET /api/payments/payouts/accounts  (admin)
async function getPayoutAccounts(req, res) {
  try {
    const accounts = await wompiService.fetchAccounts();
    if (!accounts) return res.status(500).json({ message: 'No se pudo obtener la lista de cuentas. Verifica credenciales de payouts.' });
    return res.json(accounts);
  } catch (err) {
    console.error('Error fetching payout accounts:', err);
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

    const { id: wompiTransactionId } = event.data;
    if (!wompiTransactionId) return res.status(400).json({ message: 'Webhook missing transaction id' });

    // Verificar la transacción con Wompi (fuente de verdad) y usar lógica centralizada
    try {
      const wompiData = await wompiService.verifyTransaction(wompiTransactionId);
      const payment = await Payment.findOne({ wompiTransactionId });
      if (!payment) return res.status(404).json({ message: 'Payment not found' });

      if (wompiData.status === 'APPROVED' || wompiData.status === 'successful' || wompiData.status === 'PAID') {
        try {
          await finalizePayment(payment, wompiData);
          return res.json({ success: true });
        } catch (finalErr) {
          console.error('Webhook finalize error:', finalErr.message || finalErr);
          return res.status(400).json({ success: false, message: finalErr.message });
        }
      } else if (wompiData.status === 'DECLINED' || wompiData.status === 'REJECTED') {
        payment.status = 'failed';
        await payment.save();
        return res.json({ success: true });
      }
      return res.json({ success: true });
    } catch (err) {
      console.error('Webhook processing error:', err.message || err);
      return res.status(500).json({ message: 'Webhook processing error', error: err.message });
    }
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
  getPayoutBanks,
  getPayoutAccounts,
  handleWompiWebhook
};
