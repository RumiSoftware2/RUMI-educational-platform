import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function PaymentButton({ courseId, lessonOrder, onPaymentSuccess, coursePrice = 29.99 }) {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    checkPaymentStatus();
  }, [courseId]);

  const checkPaymentStatus = async () => {
    try {
      const response = await api.get(`/payments/course/${courseId}/status`);
      setPaymentStatus(response.data);
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessingPayment(true);
    
    try {
      // Aquí se integraría con Stripe o PayPal
      // Por ahora simulamos un pago exitoso
      const mockPayment = {
        courseId,
        amount: coursePrice, // Usar el precio del curso
        paymentMethod: 'stripe',
        transactionId: `txn_${Date.now()}`
      };

      const response = await api.post('/payments', mockPayment);
      
      if (response.data.message) {
        // Verificar el estado de pago nuevamente después del pago exitoso
        await checkPaymentStatus();
        onPaymentSuccess && onPaymentSuccess();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago. Por favor, intenta de nuevo.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (paymentStatus?.hasPaid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
      >
        <div className="text-green-600 text-2xl mb-2">✅</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          ¡Ya tienes acceso completo!
        </h3>
        <p className="text-green-700">
          Has pagado por este curso y puedes continuar con todas las lecciones.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 text-center shadow-lg"
    >
      <div className="text-blue-600 text-4xl mb-4">🔒</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Contenido Premium Requerido
      </h3>
      <p className="text-gray-600 mb-4">
        Has llegado a una lección que requiere pago para continuar.
        Desbloquea todo el contenido del curso con un solo pago.
      </p>
      
      <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Precio del curso:</span>
          <span className="text-2xl font-bold text-green-600">${coursePrice}</span>
        </div>
        <div className="text-sm text-gray-500">
          Acceso completo a todas las lecciones
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        disabled={processingPayment}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-lg hover:from-green-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processingPayment ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Procesando pago...
          </div>
        ) : (
          'Pagar y Continuar'
        )}
      </motion.button>

      <div className="mt-4 text-xs text-gray-500">
        <p>💳 Pago seguro con Stripe</p>
        <p>🔄 Reembolso disponible en 30 días</p>
      </div>
    </motion.div>
  );
} 