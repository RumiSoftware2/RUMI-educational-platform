import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function PaymentConfigModal({ 
  isOpen, 
  onClose, 
  course, 
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    paidFromLesson: 1,
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Solo permitir números y un punto decimal
      const regex = /^\d*\.?\d{0,2}$/;
      if (value === '' || regex.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 1
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put(`/courses/${course._id}/set-paid`, {
        paidFromLesson: formData.paidFromLesson,
        price: parseFloat(formData.price) || 0
      });

      setMessage('Curso configurado como pago correctamente');
      onSuccess(response.data.course);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al configurar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePayment = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put(`/courses/${course._id}/remove-paid`);
      setMessage('Configuración de pago removida correctamente');
      onSuccess(response.data.course);
      
      setTimeout(() => {
        onClose();
        setMessage('');
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al remover la configuración de pago');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {course.isPaidCourse ? 'Editar Configuración de Pago' : 'Configurar Curso como Pago'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {course.isPaidCourse ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Configuración Actual</h3>
                <p className="text-green-700">
                  <strong>Pago desde lección:</strong> {course.paidFromLesson || 'No especificado'}
                </p>
                <p className="text-green-700">
                  <strong>Precio:</strong> ${course.price || 0}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Actualizar Configuración'}
                </button>
                <button
                  onClick={handleRemovePayment}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Removiendo...' : 'Remover Pago'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Desde qué lección quieres que sea pago?
                </label>
                <select
                  name="paidFromLesson"
                  value={formData.paidFromLesson}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {course.lessons?.map((lesson, index) => (
                    <option key={index} value={index + 1}>
                      Lección {index + 1}: {lesson.title}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-1">
                  Los estudiantes podrán ver las lecciones anteriores gratis
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio del curso (USD)
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Ingresa el precio en dólares (ej: 29.99)
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Información Importante</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Los estudiantes podrán ver las lecciones anteriores gratis</li>
                  <li>• Necesitarás configurar una pasarela de pagos (Stripe/PayPal)</li>
                  <li>• Esta configuración se puede cambiar en cualquier momento</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Configurando...' : 'Configurar Pago'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-lg text-center font-semibold ${
                message.includes('Error') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {message}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 