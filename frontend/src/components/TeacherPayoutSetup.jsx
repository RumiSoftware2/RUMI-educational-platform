import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function TeacherPayoutSetup() {
  const [payoutStatus, setPayoutStatus] = useState('not_configured');
  const [balance, setBalance] = useState({ totalEarnings: 0, monthlyEarnings: 0 });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedPayoutInfo, setSavedPayoutInfo] = useState(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'savings',
    documentId: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPayoutStatus();
  }, []);

  const fetchPayoutStatus = async () => {
    try {
      const res = await api.get('/payments/teacher/balance');
      setBalance(res.data);
      setPayoutStatus(res.data.payoutStatus || 'not_configured');
      if (res.data.payoutInfo) {
        setSavedPayoutInfo(res.data.payoutInfo);
        setFormData({
          bankName: res.data.payoutInfo.bankName || '',
          accountNumber: res.data.payoutInfo.accountNumber || '',
          accountType: res.data.payoutInfo.accountType || 'savings',
          documentId: res.data.payoutInfo.documentId || '',
        });
      }
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
    setMessage('');
    
    if (!formData.bankName || !formData.accountNumber || !formData.documentId) {
      setMessage('❌ Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/payments/teacher/payout-account', formData);
      if (res.data.success || res.data.message) {
        setMessage('✅ Cuenta activada automáticamente. Ya puedes recibir dinero cuando estudiantes compren tus cursos.');
        setPayoutStatus('active');
        setShowForm(false);
        setFormData({ bankName: '', accountNumber: '', accountType: 'savings', documentId: '' });
        await fetchPayoutStatus();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setMessage(`❌ Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const bankOptions = [
    'Banco de Bogotá',
    'Banco de Crédito e Inversiones',
    'Banco de Occidente',
    'Banco del Bajío',
    'Banco Falabella',
    'Banco Popular',
    'Banco Santander',
    'Bancolombia',
    'BBVA',
    'Citibank',
    'Davivienda',
    'Scotiabank',
    'Nequi',
    'Nubank',
    'Otro',
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-3xl font-bold mb-2 text-gray-800">💰 Configurar Método de Retiro</h2>
      <p className="text-gray-600 mb-6">Configura tu cuenta bancaria para recibir tus ganancias</p>

      <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Estado</p>
            <p className="text-lg font-bold">
              {payoutStatus === 'active' && (<span className="text-green-600">✓ Activo</span>)}
              {payoutStatus === 'pending' && (<span className="text-yellow-600">⏳ Pendiente</span>)}
              {payoutStatus === 'not_configured' && (<span className="text-red-600">✕ No Configurado</span>)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ganancias</p>
            <p className="text-2xl font-bold text-green-600">
              ${balance.totalEarnings?.toLocaleString('es-CO') || '0'}
            </p>
          </div>
        </div>
      </div>

      {payoutStatus === 'active' && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-green-700 font-semibold">✓ Tu método está configurado y activo</p>
        </div>
      )}

      {/* Mostrar datos guardados si existen */}
      {!showForm && savedPayoutInfo && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">✅ Cuenta Activada y Lista</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Banco</p>
              <p className="font-semibold text-gray-800">{savedPayoutInfo.bankName}</p>
            </div>
            <div>
              <p className="text-gray-600">Tipo de Cuenta</p>
              <p className="font-semibold text-gray-800 capitalize">{savedPayoutInfo.accountType}</p>
            </div>
            <div>
              <p className="text-gray-600">Número de Cuenta</p>
              <p className="font-semibold text-gray-800">•••• {savedPayoutInfo.accountNumber?.slice(-4)}</p>
            </div>
            <div>
              <p className="text-gray-600">Cédula</p>
              <p className="font-semibold text-gray-800">{savedPayoutInfo.documentId}</p>
            </div>
          </div>
          {payoutStatus === 'active' && (
            <p className="mt-3 text-sm text-green-700 font-semibold">🎉 Tu cuenta está lista. Recibirás dinero automáticamente cuando estudiantes compren tus cursos.</p>
          )}
        </div>
      )}

      {!showForm && (!savedPayoutInfo || payoutStatus !== 'active') && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold mb-4"
        >
          {savedPayoutInfo ? '✏️ Editar Datos' : '➕ Registrar Cuenta de Retiro'}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🏦 Banco</label>
            <select
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
              required
            >
              <option value="">Selecciona tu banco...</option>
              {bankOptions.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🔢 Número de Cuenta</label>
            <input
              type="text"
              name="accountNumber"
              placeholder="Ej: 1234567890"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">💳 Tipo de Cuenta</label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg"
            >
              <option value="savings">Ahorros</option>
              <option value="checking">Corriente</option>
              <option value="nequi">Nequi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📋 Cédula</label>
            <input
              type="text"
              name="documentId"
              placeholder="Tu cédula"
              value={formData.documentId}
              onChange={handleInputChange}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">
              {loading ? '⏳ Guardando...' : '✅ Guardar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-lg">
              Cancelar
            </button>
          </div>

          {message && <div className={`p-3 rounded text-center font-semibold ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>}
        </form>
      )}
    </div>
  );
}
