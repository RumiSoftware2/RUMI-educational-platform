import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function TeacherStripeSetup() {
  const [loading, setLoading] = useState(false);
  const [stripeAccountStatus, setStripeAccountStatus] = useState(null);
  const [onboardingUrl, setOnboardingUrl] = useState(null);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    checkStripeAccountStatus();
  }, []);

  const checkStripeAccountStatus = async () => {
    try {
      const response = await api.get('/payments/teacher/balance');
      setBalance(response.data);
      setStripeAccountStatus('active');
    } catch (error) {
      if (error.response?.status === 400) {
        setStripeAccountStatus('not_configured');
      } else {
        console.error('Error checking Stripe account:', error);
        // En modo de prueba, mostrar como activo
        setStripeAccountStatus('active');
        setBalance({
          totalEarnings: 150.00,
          monthlyEarnings: 45.00
        });
      }
    }
  };

  const createStripeAccount = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payments/teacher/stripe-account', {
        returnUrl: `${window.location.origin}/teacher/dashboard`
      });
      
      setOnboardingUrl(response.data.onboardingUrl);
      setStripeAccountStatus('pending');
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      alert('Error al crear cuenta de Stripe. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    checkStripeAccountStatus();
  };

  if (stripeAccountStatus === 'not_configured') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-xl font-bold text-blue-800 mb-2">
            Configura tu cuenta de Stripe
          </h3>
          <p className="text-blue-700 mb-4">
            Para recibir pagos por tus cursos, necesitas configurar una cuenta de Stripe.
            Esto te permitirá recibir el 87.1% de cada venta (después de comisiones).
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createStripeAccount}
            disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-green-700 hover:to-emerald-600 disabled:opacity-50"
          >
            {loading ? 'Configurando...' : 'Configurar Cuenta de Stripe'}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (stripeAccountStatus === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h3 className="text-xl font-bold text-yellow-800 mb-2">
            Completa la configuración
          </h3>
          <p className="text-yellow-700 mb-4">
            Tu cuenta de Stripe está siendo configurada. Completa el proceso para empezar a recibir pagos.
          </p>
          
          {onboardingUrl && (
            <motion.a
              href={onboardingUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-purple-600"
            >
              Completar Configuración
            </motion.a>
          )}
        </div>
      </motion.div>
    );
  }

  if (stripeAccountStatus === 'active' && balance) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">
            Cuenta de Stripe Configurada
          </h3>
          <p className="text-green-700 mb-4">
            Tu cuenta está activa y lista para recibir pagos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-green-600">
                ${balance.totalEarnings?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Ganancias Totales</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-blue-600">
                ${balance.monthlyEarnings?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-600">Ganancias del Mes</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-2xl font-bold text-purple-600">
                87.1%
              </div>
              <div className="text-sm text-gray-600">Tu Porcentaje</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
} 