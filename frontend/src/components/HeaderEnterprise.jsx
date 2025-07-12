// frontend/src/components/HeaderEnterprise.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo1zeus.png';

export default function HeaderEnterprise() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <img src={logo} alt="RUMI Enterprise Logo" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="text-2xl font-bold">RUMI Enterprise</h1>
              <p className="text-sm text-blue-200">Solución educativa institucional</p>
            </div>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/enterprise-rumi"
              className="text-white hover:text-blue-200 transition-colors font-medium"
            >
              Inicio
            </Link>
            
            {/* Dropdown de Soluciones */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-white hover:text-blue-200 transition-colors font-medium flex items-center space-x-1"
              >
                <span>Soluciones</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                  <Link
                    to="/enterprise/universities"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors"
                  >
                    🏛️ Universidades
                  </Link>
                  <Link
                    to="/enterprise/schools"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors"
                  >
                    🏫 Colegios
                  </Link>
                  <Link
                    to="/enterprise/corporate"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors"
                  >
                    🏢 Capacitación Corporativa
                  </Link>
                  <Link
                    to="/enterprise/government"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 transition-colors"
                  >
                    🏛️ Sector Gubernamental
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/enterprise/features"
              className="text-white hover:text-blue-200 transition-colors font-medium"
            >
              Características
            </Link>
            
            <Link
              to="/enterprise/pricing"
              className="text-white hover:text-blue-200 transition-colors font-medium"
            >
              Precios
            </Link>
            
            <Link
              to="/enterprise/case-studies"
              className="text-white hover:text-blue-200 transition-colors font-medium"
            >
              Casos de Éxito
            </Link>
            
            <Link
              to="/enterprise/contact"
              className="text-white hover:text-blue-200 transition-colors font-medium"
            >
              Contacto
            </Link>
          </nav>

          {/* Botones de acción */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/enterprise/login"
              className="text-white hover:text-blue-200 transition-colors font-medium"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/enterprise/demo"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Solicitar Demo
            </Link>
            <Link
              to="/person-rumi"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Versión Personal
            </Link>
          </div>

          {/* Botón móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-blue-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-700">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/enterprise-rumi"
                className="text-white hover:text-blue-200 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/enterprise/features"
                className="text-white hover:text-blue-200 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Características
              </Link>
              <Link
                to="/enterprise/pricing"
                className="text-white hover:text-blue-200 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Precios
              </Link>
              <Link
                to="/enterprise/case-studies"
                className="text-white hover:text-blue-200 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Casos de Éxito
              </Link>
              <Link
                to="/enterprise/contact"
                className="text-white hover:text-blue-200 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <div className="pt-4 border-t border-blue-700">
                <Link
                  to="/enterprise/login"
                  className="block text-white hover:text-blue-200 transition-colors font-medium mb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/enterprise/demo"
                  className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solicitar Demo
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 