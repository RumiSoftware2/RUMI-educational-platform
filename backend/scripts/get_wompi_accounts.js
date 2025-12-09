// Script para obtener accountId(s) desde Wompi Payouts API
// Uso: colocar WOMPI_API_KEY y WOMPI_USER_PRINCIPAL_ID en backend/.env y ejecutar:
//   npm --prefix backend install axios dotenv    # si axios no instalado
//   node -r dotenv/config backend/scripts/get_wompi_accounts.js

const axios = require('axios');
require('dotenv').config();

(async function main() {
  const API_KEY = process.env.WOMPI_API_KEY;
  const USER_PRINCIPAL = process.env.WOMPI_USER_PRINCIPAL_ID;
  const PAYOUTS_BASE = process.env.WOMPI_PAYOUTS_BASE_URL || 'https://api.payouts.wompi.co/v1';

  if (!API_KEY || !USER_PRINCIPAL) {
    console.error('Faltan variables de entorno. Añade WOMPI_API_KEY y WOMPI_USER_PRINCIPAL_ID en backend/.env');
    process.exit(2);
  }

  try {
    const headers = {
      'x-api-key': API_KEY,
      'user-principal-id': USER_PRINCIPAL
    };

    console.log(`Consultando ${PAYOUTS_BASE}/accounts ...`);
    const res = await axios.get(`${PAYOUTS_BASE}/accounts`, { headers });
    if (!res.data) {
      console.error('Respuesta vacía de Wompi');
      process.exit(1);
    }

    const accounts = res.data.data || res.data;
    console.log('\nResultado (raw):');
    console.log(JSON.stringify(res.data, null, 2));

    if (Array.isArray(accounts) && accounts.length) {
      console.log('\nCuentas encontradas:');
      accounts.forEach((a, i) => {
        console.log(`- [${i}] id: ${a.id} | name: ${a.name || a.accountName || 'n/a'} | type: ${a.type || a.accountType || 'n/a'}`);
      });
      console.log('\nUsa el valor `id` que corresponda como WOMPI_ACCOUNT_ID en tu .env');
    } else if (accounts && accounts.id) {
      console.log(`\nAccountId: ${accounts.id}`);
      console.log('Usa este valor como WOMPI_ACCOUNT_ID en tu .env');
    } else {
      console.log('\nNo se encontraron cuentas. Revisa permisos/credenciales en Wompi dashboard.');
    }
  } catch (err) {
    console.error('Error al consultar /accounts:', err.response?.data || err.message || err);
    process.exit(1);
  }
})();
