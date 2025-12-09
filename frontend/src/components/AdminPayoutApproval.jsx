// ❌ ARCHIVO DEPRECADO - YA NO SE NECESITA
// Las cuentas de retiro se activan AUTOMÁTICAMENTE cuando el docente las registra
// No hay aprobación manual por administrador

import React from 'react';

export default function AdminPayoutApproval() {
  return (
    <div className="w-full max-w-4xl mx-auto bg-blue-50 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-2 text-blue-800">ℹ️ Información</h2>
      <p className="text-blue-700">
        Las cuentas de retiro se activan automáticamente cuando los docentes las registran. 
        No se requiere aprobación manual.
      </p>
    </div>
  );
}
