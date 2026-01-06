import { useState, useEffect } from 'react';
import api from '../services/api';

export default function BankAccountForm() {
  const [formData, setFormData] = useState({
    accountHolder: '',
    accountNumber: '',
    accountType: 'checking',
    bankName: '',
    bankCode: '',
    routingNumber: '',
    country: 'CO'
  });

  const [bankAccount, setBankAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Cargar cuenta bancaria existente
  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const res = await api.get('/bank-accounts');
        if (res.data) {
          setBankAccount(res.data);
          setFormData({
            accountHolder: res.data.accountHolder || '',
            accountNumber: res.data.accountNumberLast4 ? '*'.repeat(8) + res.data.accountNumberLast4 : '',
            accountType: res.data.accountType || 'checking',
            bankName: res.data.bankName || '',
            bankCode: res.data.bankCode || '',
            routingNumber: res.data.routingNumber || '',
            country: res.data.country || 'CO'
          });
        }
      } catch (error) {
        console.log('No hay cuenta bancaria registrada');
      }
    };

    fetchBankAccount();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/bank-accounts', formData);
      setBankAccount(res.data.bankAccount);
      setMessage('✅ Cuenta bancaria guardada exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    setLoading(true);
    setMessage('');

    try {
      await api.post('/bank-accounts/verify/send-code');
      setMessage('✅ Código de verificación enviado a tu correo');
      setVerificationStep(true);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (!verificationCode) {
      setMessage('❌ Por favor ingresa el código de verificación');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/bank-accounts/verify/confirm-code', {
        verificationCode
      });
      setBankAccount(res.data.bankAccount);
      setMessage('✅ Cuenta bancaria verificada exitosamente');
      setVerificationStep(false);
      setVerificationCode('');
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg border-2 border-blue-200">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">💳 Información Bancaria</h2>

      {bankAccount && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Banco registrado: <span className="font-semibold">{bankAccount.bankName}</span></p>
              <p className="text-sm text-gray-600">Titular: <span className="font-semibold">{bankAccount.accountHolder}</span></p>
              <p className="text-sm text-gray-600">Cuenta: ****{bankAccount.accountNumberLast4}</p>
              <p className="text-sm text-gray-600">Estado: {bankAccount.isVerified ? '✅ Verificada' : '⏳ Pendiente de verificación'}</p>
            </div>
            {!bankAccount.isVerified && (
              <button
                onClick={handleVerifyAccount}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Verificar Cuenta
              </button>
            )}
          </div>
        </div>
      )}

      {verificationStep ? (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
          <h3 className="font-bold text-lg mb-4">Verificar Cuenta Bancaria</h3>
          <p className="text-sm text-gray-600 mb-4">
            Hemos enviado un código de verificación a tu correo. Por favor, ingresa el código:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Código de verificación"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              maxLength="6"
              className="flex-1 p-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={handleConfirmVerification}
              disabled={loading || !verificationCode}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
          <button
            onClick={() => setVerificationStep(false)}
            className="mt-3 text-sm text-gray-600 hover:text-gray-800"
          >
            ← Volver
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Titular de la Cuenta</label>
            <input
              type="text"
              name="accountHolder"
              value={formData.accountHolder}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Cuenta</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Número de cuenta"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Cuenta</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="checking">Corriente</option>
                <option value="savings">Ahorros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="CO">Colombia</option>
                <option value="MX">México</option>
                <option value="AR">Argentina</option>
                <option value="US">Estados Unidos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Banco</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Ej: Banco de Bogotá"
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Código del Banco</label>
              <input
                type="text"
                name="bankCode"
                value={formData.bankCode}
                onChange={handleChange}
                placeholder="Ej: 012"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Routing Number</label>
              <input
                type="text"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleChange}
                placeholder="Routing number"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Datos Bancarios'}
          </button>
        </form>
      )}

      {message && (
        <div className={`mt-4 p-4 rounded-lg text-center font-semibold ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
