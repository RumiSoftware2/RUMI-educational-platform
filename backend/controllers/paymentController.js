const Payment = require('../models/Payment');
const Course = require('../models/Course');
const User = require('../models/User');
const BankAccount = require('../models/BankAccount');
const crypto = require('crypto');

// Configuración de Wompi
const WOMPI_SANDBOX = process.env.WOMPI_SANDBOX === 'true';
const WOMPI_PUBLIC_KEY = WOMPI_SANDBOX ? process.env.WOMPI_PUBLIC_KEY_SANDBOX : process.env.WOMPI_PUBLIC_KEY;
const WOMPI_INTEGRITY_SECRET = WOMPI_SANDBOX ? process.env.WOMPI_INTEGRITY_SECRET_SANDBOX : process.env.WOMPI_INTEGRITY_SECRET;
const WOMPI_EVENT_SECRET = WOMPI_SANDBOX ? process.env.WOMPI_EVENT_SECRET_SANDBOX : process.env.WOMPI_EVENT_SECRET;

// Crear un pago para un curso
const createPayment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Validar que el curso exista
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Validar que el curso sea de pago
    if (!course.isPaid) {
      return res.status(400).json({ message: 'Este curso no es de pago' });
    }

    // Validar que el estudiante no haya pagado ya
    const existingPayment = course.paidStudents.find(p => String(p.student) === String(studentId));
    if (existingPayment) {
      return res.status(400).json({ message: 'Ya has pagado este curso' });
    }

    // Crear registro de pago
    const payment = new Payment({
      course: courseId,
      student: studentId,
      teacher: course.teacher,
      amount: course.price,
      currency: 'COP', // Wompi usa COP
      status: 'pending',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    await payment.save();

    // Generar firma de integridad para Wompi
    const amountInCents = Math.round(course.price * 100); // Convertir a centavos
    const reference = payment.transactionId;
    const currency = 'COP';
    const integritySecret = WOMPI_INTEGRITY_SECRET;
    
    const signatureString = `${reference}${amountInCents}${currency}${integritySecret}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    res.status(201).json({
      message: 'Pago iniciado',
      payment: payment,
      wompiData: {
        publicKey: WOMPI_PUBLIC_KEY,
        currency: currency,
        amountInCents: amountInCents,
        reference: reference,
        signature: signature,
        redirectUrl: `${process.env.FRONTEND_URL}/payment/success` // Opcional
      }
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ message: 'Error al crear pago', error: error.message });
  }
};

// Procesar confirmación de pago del banco
const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { bankTransactionId, status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    if (status === 'completed' || status === 'success') {
      // Actualizar estado del pago
      payment.status = 'completed';
      payment.bankTransactionId = bankTransactionId;
      payment.paidAt = new Date();
      await payment.save();

      // Agregar estudiante a la lista de pagos del curso
      const course = await Course.findById(payment.course);
      if (course) {
        course.paidStudents.push({
          student: payment.student,
          transactionId: bankTransactionId
        });
        // Si no estaba inscrito, agregarlo
        if (!course.students.includes(payment.student)) {
          course.students.push(payment.student);
        }
        await course.save();
      }

      // Actualizar ganancias del profesor
      const bankAccount = await BankAccount.findOne({ teacher: payment.teacher });
      if (bankAccount) {
        bankAccount.totalEarnings += payment.amount;
        bankAccount.pendingPayouts += payment.amount;
        await bankAccount.save();
      }

      res.status(200).json({
        message: 'Pago confirmado exitosamente',
        payment: payment
      });
    } else {
      payment.status = 'failed';
      payment.notes = `Pago fallido: ${status}`;
      await payment.save();

      res.status(400).json({
        message: 'El pago no fue completado',
        payment: payment
      });
    }
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ message: 'Error al confirmar pago', error: error.message });
  }
};

// Webhook para confirmación de pagos desde Wompi
const confirmPaymentWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    // Validar firma del evento
    const isValidSignature = validateWompiEventSignature(event);
    if (!isValidSignature) {
      console.log('Firma del evento inválida');
      return res.status(400).json({ message: 'Firma inválida' });
    }
    
    // Validar que sea un evento de transacción
    if (event.event !== 'transaction.updated') {
      return res.status(200).json({ message: 'Evento no procesado' });
    }

    const transaction = event.data.transaction;
    
    // Buscar pago por referencia
    const payment = await Payment.findOne({ transactionId: transaction.reference });
    if (!payment) {
      console.log('Pago no encontrado para referencia:', transaction.reference);
      return res.status(200).json({ message: 'Pago no encontrado' });
    }

    // Actualizar estado según el status de Wompi
    if (transaction.status === 'APPROVED') {
      payment.status = 'completed';
      payment.bankTransactionId = transaction.id;
      payment.paidAt = new Date();
      await payment.save();

      // Agregar estudiante al curso
      const course = await Course.findById(payment.course);
      if (course) {
        course.paidStudents.push({
          student: payment.student,
          transactionId: transaction.id,
          paidAt: new Date()
        });
        if (!course.students.includes(payment.student)) {
          course.students.push(payment.student);
        }
        await course.save();
      }

      // Actualizar ganancias del docente
      const bankAccount = await BankAccount.findOne({ teacher: payment.teacher });
      if (bankAccount) {
        bankAccount.totalEarnings += payment.amount;
        bankAccount.pendingPayouts += payment.amount;
        await bankAccount.save();
      }

      console.log('Pago confirmado exitosamente:', payment._id);
    } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
      payment.status = 'failed';
      payment.notes = `Transacción ${transaction.status}`;
      await payment.save();
      console.log('Pago fallido:', payment._id);
    }

    res.status(200).json({ message: 'Evento procesado' });
  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(500).json({ message: 'Error procesando webhook' });
  }
};

// Función para validar la firma del evento de Wompi
const validateWompiEventSignature = (event) => {
  try {
    const { signature, timestamp } = event;
    const eventSecret = WOMPI_EVENT_SECRET;
    
    // Concatenar valores de las propiedades en orden
    let concatenatedString = '';
    for (const property of signature.properties) {
      const value = getNestedProperty(event.data, property);
      if (value !== undefined) {
        concatenatedString += value;
      }
    }
    
    // Agregar timestamp
    concatenatedString += timestamp;
    
    // Agregar secreto
    concatenatedString += eventSecret;
    
    // Generar hash SHA256
    const calculatedChecksum = crypto.createHash('sha256').update(concatenatedString).digest('hex');
    
    // Comparar con el checksum enviado
    return calculatedChecksum === signature.checksum;
  } catch (error) {
    console.error('Error validando firma:', error);
    return false;
  }
};

// Función auxiliar para obtener propiedades anidadas
const getNestedProperty = (obj, path) => {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

// Obtener historial de pagos de un estudiante
const getStudentPayments = async (req, res) => {
  try {
    const studentId = req.user.id;
    const payments = await Payment.find({ student: studentId })
      .populate('course', 'title price')
      .populate('teacher', 'name email');

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ message: 'Error al obtener pagos', error: error.message });
  }
};

// Obtener pagos de un curso (solo el docente)
const getCoursePayments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    if (String(course.teacher) !== String(teacherId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const payments = await Payment.find({ course: courseId })
      .populate('student', 'name email')
      .sort({ paidAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error al obtener pagos del curso:', error);
    res.status(500).json({ message: 'Error al obtener pagos', error: error.message });
  }
};

// Obtener estado de pago
const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error('Error al obtener estado de pago:', error);
    res.status(500).json({ message: 'Error al obtener estado de pago', error: error.message });
  }
};

// Verificar si un estudiante ha pagado un curso
const hasStudentPaid = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    const hasPaid = course.paidStudents.some(p => String(p.student) === String(studentId));

    res.status(200).json({ hasPaid, isPaidCourse: course.isPaid });
  } catch (error) {
    console.error('Error al verificar pago:', error);
    res.status(500).json({ message: 'Error al verificar pago', error: error.message });
  }
};

// Obtener estadísticas de ingresos del docente
const getTeacherEarnings = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const payments = await Payment.find({
      teacher: teacherId,
      status: 'completed'
    });

    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;

    res.status(200).json({
      totalEarnings,
      totalTransactions,
      payments
    });
  } catch (error) {
    console.error('Error al obtener ingresos:', error);
    res.status(500).json({ message: 'Error al obtener ingresos', error: error.message });
  }
};

// Reembolsar pago
const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Solo admin o el docente del curso pueden reembolsar
    const course = await Course.findById(payment.course);
    if (String(course.teacher) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Actualizar estado del pago
    payment.status = 'refunded';
    await payment.save();

    // Remover del curso si es necesario
    course.paidStudents = course.paidStudents.filter(
      p => String(p.student) !== String(payment.student)
    );
    await course.save();

    // Actualizar ganancias del profesor
    const bankAccount = await BankAccount.findOne({ teacher: payment.teacher });
    if (bankAccount) {
      bankAccount.totalEarnings -= payment.amount;
      bankAccount.pendingPayouts -= payment.amount;
      await bankAccount.save();
    }

    res.status(200).json({
      message: 'Pago reembolsado exitosamente',
      payment: payment
    });
  } catch (error) {
    console.error('Error al reembolsar pago:', error);
    res.status(500).json({ message: 'Error al reembolsar pago', error: error.message });
  }
};

module.exports = {
  createPayment,
  confirmPayment,
  confirmPaymentWebhook,
  getStudentPayments,
  getCoursePayments,
  getPaymentStatus,
  hasStudentPaid,
  getTeacherEarnings,
  refundPayment
};
