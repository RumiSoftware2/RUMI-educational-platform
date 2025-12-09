import React, { useEffect, useState } from 'react';
import api, { createTransaction, checkPaymentStatus } from '../services/api';

export default function PaymentButton({ courseId, coursePrice = 29.99, onPaymentSuccess }) {
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await checkPaymentStatus(courseId);
        setHasPaid(res.data.hasPaid);
      } catch (err) {
        // ignore
      }
    };
    fetchStatus();
  }, [courseId]);

  const handlePay = async () => {
    setLoading(true);
    try {
      // ✅ Solo enviar courseId, el backend obtiene el precio de la BD
      const res = await createTransaction({ courseId });
      if (res.data && res.data.checkoutUrl) {
        // redirigir al checkout hosted
        window.location.href = res.data.checkoutUrl;
      } else {
        console.error('No checkoutUrl returned');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (hasPaid) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold text-lg">
          ✓ Acceso comprado
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <button 
        onClick={handlePay} 
        disabled={loading} 
        className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {loading ? '⏳ Preparando pago...' : `💳 Pagar $${coursePrice.toLocaleString('es-CO')} COP`}
      </button>
    </div>
  );
}
