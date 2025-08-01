const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');

// Crear una transacción de pago
const createPayment = async (req, res) => {
  try {
    const { courseId, amount, paymentMethod, transactionId } = req.body;
    
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

    const payment = new Payment({
      student: req.user.id,
      course: courseId,
      amount,
      paymentMethod,
      transactionId,
      status: 'completed'
    });

    const savedPayment = await payment.save();

    // Agregar al estudiante al curso
    if (!course.students.includes(req.user.id)) {
      course.students.push(req.user.id);
      await course.save();
    }

    res.status(201).json({
      message: 'Pago procesado correctamente',
      payment: savedPayment
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

    res.status(200).json({
      totalRevenue,
      totalPayments,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas de pagos', error: error.message });
  }
};

module.exports = {
  createPayment,
  getUserPayments,
  checkPaymentStatus,
  getCoursePaymentStats
}; 