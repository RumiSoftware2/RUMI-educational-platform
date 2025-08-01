import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCoursePaymentStats } from '../services/api';

export default function PaymentStats({ courseId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentStats();
  }, [courseId]);

  const fetchPaymentStats = async () => {
    try {
      setLoading(true);
      const response = await getCoursePaymentStats(courseId);
      setStats(response.data);
    } catch (err) {
      setError('Error al cargar las estadísticas de pagos');
      console.error('Error fetching payment stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📊</span>
        <h3 className="text-lg font-bold text-purple-800">Estadísticas de Pagos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Ingresos Totales</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPayments}</div>
          <div className="text-sm text-gray-600">Pagos Realizados</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalPayments > 0 ? (stats.totalRevenue / stats.totalPayments).toFixed(2) : 0}
          </div>
          <div className="text-sm text-gray-600">Promedio por Pago</div>
        </div>
      </div>

      {stats.payments && stats.payments.length > 0 && (
        <div>
          <h4 className="font-semibold text-purple-800 mb-3">Pagos Recientes</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {stats.payments.slice(0, 5).map((payment, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800">
                      {payment.student?.name || 'Estudiante'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${payment.amount}</div>
                    <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
} 