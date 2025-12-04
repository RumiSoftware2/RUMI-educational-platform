import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/PaymentSuccess.css';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const courseId = searchParams.get('courseId');
        const transactionId = searchParams.get('transactionId');

        if (!courseId) {
          setStatus('error');
          return;
        }

        // Verify payment status
        const response = await api.checkPaymentStatus(courseId);
        
        if (response.data.hasPaid) {
          setPaymentData(response.data);
          setStatus('success');
        } else {
          setStatus('pending');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [searchParams]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/student/courses');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  if (status === 'loading') {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card">
          <div className="spinner"></div>
          <h2>Verificando pago...</h2>
          <p>Por favor espera mientras verificamos tu transacción.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card success">
          <div className="success-icon">✓</div>
          <h2>¡Pago Exitoso!</h2>
          <p className="success-message">
            Tu pago ha sido procesado correctamente. Ahora tienes acceso al curso.
          </p>
          {paymentData && (
            <div className="payment-details">
              <p>
                <strong>Monto pagado:</strong> ${paymentData.amount?.toLocaleString('es-CO')} COP
              </p>
              <p>
                <strong>Estado:</strong> <span className="badge-success">{paymentData.status}</span>
              </p>
            </div>
          )}
          <p className="redirect-message">
            Serás redirigido a tus cursos en <strong>{countdown}s</strong>
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/student/courses')}
          >
            Ir a mis cursos ahora
          </button>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="payment-success-container">
        <div className="payment-success-card pending">
          <div className="pending-icon">⏳</div>
          <h2>Pago Pendiente</h2>
          <p className="pending-message">
            Tu pago está siendo procesado. Por favor intenta nuevamente en unos momentos.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/student/courses')}
          >
            Volver a mis cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-container">
      <div className="payment-success-card error">
        <div className="error-icon">✕</div>
        <h2>Error al verificar el pago</h2>
        <p className="error-message">
          Ocurrió un problema al verificar tu pago. Por favor contacta con soporte.
        </p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/student/courses')}
        >
          Volver a mis cursos
        </button>
      </div>
    </div>
  );
}
