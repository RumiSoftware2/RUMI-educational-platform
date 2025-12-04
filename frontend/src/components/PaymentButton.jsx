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
      const res = await createTransaction({ courseId, amount: coursePrice });
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

  if (hasPaid) return <div className="text-green-600">Acceso comprado</div>;

  return (
    <div>
      <button onClick={handlePay} disabled={loading} className="btn-primary">
        {loading ? 'Preparando pago...' : `Pagar ${coursePrice}`}
      </button>
    </div>
  );
}
