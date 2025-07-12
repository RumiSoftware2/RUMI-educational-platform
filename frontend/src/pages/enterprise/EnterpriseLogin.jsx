// frontend/src/pages/enterprise/EnterpriseLogin.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeaderEnterprise from '../../components/HeaderEnterprise';

export default function EnterpriseLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    institution: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implementar lógica de autenticación empresarial
    console.log('Enterprise login:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-200">
      <HeaderEnterprise />
      
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Acceso Empresarial
            </h2>
            <p className="text-slate-600">
              Inicia sesión en tu cuenta institucional
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Institución
              </label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre de tu institución"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@institucion.edu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-slate-700 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-slate-800 hover:to-blue-800 transition-all duration-300"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              ¿No tienes cuenta?{' '}
              <Link
                to="/enterprise/contact"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contacta con ventas
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Sistema de autenticación empresarial en desarrollo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 