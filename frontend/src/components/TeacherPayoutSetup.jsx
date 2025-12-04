import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function TeacherPayoutSetup() {
  const [payoutStatus, setPayoutStatus] = useState('not_configured');
  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'savings',
    documentId: '',
  });

  useEffect(() => {
    fetchPayoutStatus();
  }, []);

  const fetchPayoutStatus = async () => {
    try {
      const res = await api.get('/payments/teacher/balance');
      setBalance(res.data.totalEarnings || 0);
      setPayoutStatus(res.data.payoutStatus || 'not_configured');
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/payments/teacher/payout-account', formData);
      if (res.data.success) {
        setPayoutStatus('pending');
        setShowForm(false);
        setFormData({ bankName: '', accountNumber: '', accountType: 'savings', documentId: '' });
        alert('Información de retiro guardada. Verificación pendiente.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar información: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Configurar Método de Retiro</h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm font-semibold mb-2">Estado: {payoutStatus}</p>
        <p className="text-lg font-bold text-green-600">Balance: ${balance.toFixed(2)}</p>
      </div>

      {payoutStatus === 'active' && (
        <div className="text-green-600 mb-4">✓ Método de retiro configurado y activo</div>
      )}

      {payoutStatus === 'pending' && (
        <div className="text-yellow-600 mb-4">⏳ Verificación pendiente</div>
      )}

      {payoutStatus === 'not_configured' && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Configurar Retiro
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Banco</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              placeholder="Nombre del banco"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Número de Cuenta</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              placeholder="Número de cuenta"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Tipo de Cuenta</label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="savings">Ahorros</option>
              <option value="checking">Corriente</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Cédula / Identificación</label>
            <input
              type="text"
              name="documentId"
              value={formData.documentId}
              onChange={handleInputChange}
              placeholder="Tu identificación"
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
