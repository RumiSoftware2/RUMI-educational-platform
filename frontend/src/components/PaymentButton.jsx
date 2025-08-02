import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';

// Cargar Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '');

// Componente interno para el formulario de pago
function CheckoutForm({ courseId, coursePrice, onPaymentSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setProcessingPayment(false);
        return;
      }

      // Confirmar pago
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (confirmError) {
        setError(confirmError.message);
        setProcessingPayment(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirmar pago en el backend
        const response = await api.post('/payments', {
          courseId,
          amount: coursePrice,
          paymentMethod: 'stripe',
          paymentIntentId: paymentIntent.id
        });
        
        if (response.data.message) {
          onPaymentSuccess && onPaymentSuccess();
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Error al procesar el pago. Por favor, intenta de nuevo.');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={processingPayment}
          className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-gray-600 disabled:opacity-50"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={!stripe || processingPayment}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:from-green-700 hover:to-emerald-600 disabled:opacity-50"
        >
          {processingPayment ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Procesando...
            </div>
          ) : (
            `Pagar $${coursePrice}`
          )}
        </button>
      </div>
    </form>
  );
}

export default function PaymentButton({ courseId, lessonOrder, onPaymentSuccess, coursePrice = 29.99 }) {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

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

  const handleStartPayment = async () => {
    try {
      // Crear Payment Intent en el backend
      const paymentIntentResponse = await api.post('/payments/create-intent', {
        courseId,
        amount: coursePrice
      });

      setClientSecret(paymentIntentResponse.data.clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Error al iniciar el pago. Por favor, intenta de nuevo.');
    }
  };

  const handlePaymentSuccess = async () => {
    await checkPaymentStatus();
    setShowPaymentForm(false);
    setClientSecret(null);
    onPaymentSuccess && onPaymentSuccess();
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
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

  if (showPaymentForm && clientSecret) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg"
      >
        <div className="text-center mb-4">
          <div className="text-blue-600 text-2xl mb-2">💳</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Información de Pago
          </h3>
          <p className="text-gray-600 text-sm">
            Completa tu información de pago para continuar
          </p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            courseId={courseId}
            coursePrice={coursePrice}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handleCancelPayment}
          />
        </Elements>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>💳 Pago seguro con Stripe</p>
          <p>🔄 Reembolso disponible en 30 días</p>
          <p className="mt-2 text-blue-600">
            💡 <strong>Modo de prueba:</strong> Usa 4242 4242 4242 4242
          </p>
        </div>
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
        onClick={handleStartPayment}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-lg hover:from-green-700 hover:to-emerald-600"
      >
        Pagar y Continuar
      </motion.button>

      <div className="mt-4 text-xs text-gray-500">
        <p>💳 Pago seguro con Stripe</p>
        <p>🔄 Reembolso disponible en 30 días</p>
      </div>
    </motion.div>
  );
} 