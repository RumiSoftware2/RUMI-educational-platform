const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const stripeService = require('../services/stripeService');

// Crear Payment Intent para Stripe
const createPaymentIntent = async (req, res) => {
  try {
    const { courseId, amount } = req.body;
    
    // Verificar que el curso existe y es pago
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    if (!course.isPaidCourse) {
      return res.status(400).json({ message: 'Este curso no requiere pago' });
    }

    // Verificar que el usuario no haya pagado ya por este curso
    const existingPayment = await Payment.findOne({
      student: req.user.id,
      course: courseId,
      status: 'completed'
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Ya has pagado por este curso' });
    }

    // Crear Payment Intent con Stripe
    const paymentIntent = await stripeService.createPaymentIntent(amount, 'usd', {
      courseId,
      studentId: req.user.id,
      teacherId: course.teacher,
      teacherStripeAccountId: course.teacher ? (await User.findById(course.teacher))?.stripeAccountId : null
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error al crear Payment Intent:', error);
    res.status(500).json({ message: 'Error al crear Payment Intent', error: error.message });
  }
};

// Crear una transacción de pago
const createPayment = async (req, res) => {
  try {
    const { courseId, amount, paymentMethod, paymentIntentId } = req.body;
    
    // Verificar que el curso existe y es pago
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    if (!course.isPaidCourse) {
      return res.status(400).json({ message: 'Este curso no requiere pago' });
    }

    // Verificar que el usuario no haya pagado ya por este curso
    const existingPayment = await Payment.findOne({
      student: req.user.id,
      course: courseId,
      status: 'completed'
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Ya has pagado por este curso' });
    }

    // Confirmar pago con Stripe y procesar distribución
    const paymentResult = await stripeService.confirmPayment(
      paymentIntentId, 
      courseId, 
      course.teacher
    );

    if (!paymentResult.success) {
      return res.status(400).json({ message: 'Error al confirmar el pago' });
    }

    // Crear el pago con información de distribución
    const payment = new Payment({
      student: req.user.id,
      course: courseId,
      amount: paymentResult.amount,
      paymentMethod: 'stripe',
      transactionId: paymentIntentId,
      status: 'completed',
      stripePaymentIntentId: paymentIntentId,
      stripeTransferId: paymentResult.transferId,
      stripeFee: paymentResult.feeDistribution.stripeFee,
      platformFee: paymentResult.feeDistribution.platformFee,
      teacherAmount: paymentResult.feeDistribution.teacherAmount,
      platformPercentage: 10
    });

    const savedPayment = await payment.save();

    // Agregar al estudiante al curso
    if (!course.students.includes(req.user.id)) {
      course.students.push(req.user.id);
      await course.save();
    }

    // Actualizar ganancias del docente
    if (course.teacher) {
      const teacher = await User.findById(course.teacher);
      if (teacher) {
        teacher.totalEarnings += paymentResult.feeDistribution.teacherAmount;
        teacher.monthlyEarnings += paymentResult.feeDistribution.teacherAmount;
        await teacher.save();
      }
    }

    res.status(201).json({
      message: 'Pago procesado correctamente',
      payment: savedPayment,
      feeDistribution: paymentResult.feeDistribution
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ message: 'Error al procesar el pago', error: error.message });
  }
};

// Obtener pagos de un usuario
const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate('course', 'title')
      .sort({ paymentDate: -1 });
    
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pagos', error: error.message });
  }
};

// Verificar si un usuario ha pagado por un curso
const checkPaymentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const payment = await Payment.findOne({
      student: req.user.id,
      course: courseId,
      status: 'completed'
    });

    res.status(200).json({
      hasPaid: !!payment,
      payment: payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar el estado del pago', error: error.message });
  }
};

// Obtener estadísticas de pagos para un curso (solo para docentes)
const getCoursePaymentStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verificar que el usuario es el docente del curso
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    if (req.user.role !== 'admin' && String(course.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: 'No autorizado para ver estas estadísticas' });
    }

    const payments = await Payment.find({ 
      course: courseId,
      status: 'completed'
    }).populate('student', 'name email');

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPayments = payments.length;
    const totalTeacherEarnings = payments.reduce((sum, payment) => sum + (payment.teacherAmount || 0), 0);
    const totalPlatformFees = payments.reduce((sum, payment) => sum + (payment.platformFee || 0), 0);

    res.status(200).json({
      totalRevenue,
      totalPayments,
      totalTeacherEarnings,
      totalPlatformFees,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas de pagos', error: error.message });
  }
};

// Crear cuenta de Stripe para docente
const createTeacherStripeAccount = async (req, res) => {
  try {
    const { returnUrl } = req.body;
    
    if (req.user.role !== 'docente' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los docentes pueden crear cuentas de Stripe' });
    }

    // Verificar si ya tiene una cuenta
    if (req.user.stripeAccountId) {
      return res.status(400).json({ message: 'Ya tienes una cuenta de Stripe configurada' });
    }

    // Crear cuenta en Stripe
    const account = await stripeService.createTeacherAccount(req.user.email, req.user.name);
    
    // Actualizar usuario con la cuenta de Stripe
    req.user.stripeAccountId = account.id;
    req.user.stripeAccountStatus = 'pending';
    await req.user.save();

    // Crear link de onboarding
    const onboardingLink = await stripeService.createOnboardingLink(account.id, returnUrl);

    res.status(200).json({
      message: 'Cuenta de Stripe creada exitosamente',
      accountId: account.id,
      onboardingUrl: onboardingLink.url
    });
  } catch (error) {
    console.error('Error al crear cuenta de Stripe:', error);
    res.status(500).json({ message: 'Error al crear cuenta de Stripe', error: error.message });
  }
};

// Obtener balance del docente
const getTeacherBalance = async (req, res) => {
  try {
    if (req.user.role !== 'docente' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los docentes pueden ver su balance' });
    }

    if (!req.user.stripeAccountId) {
      return res.status(400).json({ message: 'No tienes una cuenta de Stripe configurada' });
    }

    const balance = await stripeService.getTeacherBalance(req.user.stripeAccountId);

    res.status(200).json({
      balance,
      totalEarnings: req.user.totalEarnings,
      monthlyEarnings: req.user.monthlyEarnings
    });
  } catch (error) {
    console.error('Error al obtener balance:', error);
    res.status(500).json({ message: 'Error al obtener balance', error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  createPayment,
  getUserPayments,
  checkPaymentStatus,
  getCoursePaymentStats,
  createTeacherStripeAccount,
  getTeacherBalance
}; 