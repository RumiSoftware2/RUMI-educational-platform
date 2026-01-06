import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PaymentButton({ courseId, courseName, price, currency = 'USD' }) {
  const [loading, setLoading] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isPaidCourse, setIsPaidCourse] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Verificar si el estudiante ya pagó
  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const res = await api.get(`/payments/courses/${courseId}/has-paid`);
        setHasPaid(res.data.hasPaid);
        setIsPaidCourse(res.data.isPaidCourse);
      } catch (error) {
        console.error('Error al verificar pago:', error);
      }
    };

    if (courseId) {
      checkPaymentStatus();
      
      // Refresca el estado cada 3 segundos después de volver del pago
      const interval = setInterval(checkPaymentStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [courseId]);

  const handleInitiatePayment = async () => {
    setLoading(true);
    setPaymentMessage('');

    try {
      const res = await api.post(`/payments/courses/${courseId}/pay`);

      // El ID del banco en Java que maneja los pagos
      const bankPaymentUrl = res.data.bankPaymentUrl;

      // Aquí redirigimos al sistema de pagos del banco
      // El banco enviará un webhook de confirmación a confirmPayment
      if (bankPaymentUrl) {
        // Abrir ventana del banco para completar el pago
        window.location.href = bankPaymentUrl;
      } else {
        setPaymentMessage(`✅ Pago iniciado. ID: ${res.data.payment._id}`);
      }
    } catch (error) {
      setPaymentMessage(`❌ ${error.response?.data?.message || 'Error al iniciar pago'}`);
    } finally {
      setLoading(false);
    }
  };

  // Si no es un curso de pago
  if (!isPaidCourse) {
    return null;
  }

  // Si ya pagó
  if (hasPaid) {
    return (
      <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 rounded-lg text-center">
        <p className="text-green-700 font-bold text-lg">✅ Ya tienes acceso a este curso</p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-3 border-yellow-300 rounded-xl">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-orange-700 mb-2">🔒 Curso Premium</h3>
        <p className="text-gray-700 mb-3">Debes pagar para acceder al contenido completo de este curso</p>

        <div className="bg-white p-4 rounded-lg mb-4 text-center">
          <p className="text-sm text-gray-600">Precio del curso:</p>
          <p className="text-3xl font-bold text-orange-600">
            {price} <span className="text-lg">{currency}</span>
          </p>
        </div>

        {showPaymentForm ? (
          <div className="space-y-3 bg-white p-4 rounded-lg">
            <p className="text-sm text-gray-700 font-semibold">Confirma que deseas pagar por acceso completo a:</p>
            <p className="text-lg font-bold text-gray-900">{courseName}</p>
            
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 border border-blue-300">
              ℹ️ Serás redirigido al sistema seguro de pagos para completar la transacción
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : '💳 Proceder a Pagar'}
              </button>

              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setPaymentMessage('');
                }}
                className="flex-1 px-4 py-3 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 transition"
              >
                ← Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowPaymentForm(true)}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            🔓 Pagar y Desbloquear Curso
          </button>
        )}
      </div>

      {paymentMessage && (
        <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${paymentMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {paymentMessage}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded">
        <p className="mb-2">✓ Pago seguro y encriptado</p>
        <p className="mb-2">✓ Acceso ilimitado después de pagar</p>
        <p>✓ Garantía de satisfacción</p>
      </div>
    </div>
  );
}
