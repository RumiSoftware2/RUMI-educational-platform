const axios = require('axios');
const Payment = require('../models/Payment');

const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
// Para Pagos a Terceros Wompi (payouts) - usar x-api-key + user-principal-id
const WOMPI_API_KEY = process.env.WOMPI_API_KEY || WOMPI_PRIVATE_KEY;
const WOMPI_USER_PRINCIPAL_ID = process.env.WOMPI_USER_PRINCIPAL_ID;
// URLs de producción de Wompi
const BASE_URL = 'https://production.wompi.co/v1';
const PAYOUTS_BASE_URL = 'https://api.payouts.wompi.co/v1';
const ACCOUNT_ID = process.env.WOMPI_ACCOUNT_ID || process.env.WOMPI_ACCOUNT; // Cuenta origen para payouts (acepta WOMPI_ACCOUNT_ID o WOMPI_ACCOUNT)

// Valores por defecto: 2% Wompi, 8% Plataforma, 0 fijo
const WOMPI_FEE_PERCENT = parseFloat(process.env.WOMPI_FEE_PERCENT) || 0.02;
const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT) || 0.08;
const WOMPI_FIXED_FEE = parseFloat(process.env.WOMPI_FIXED_FEE) || 0;

// Map de bancos (bankId según docs Wompi)
const BANK_IDS = {
  // legacy numeric codes (kept for backward compatibility)
  'nequi': '1507',
  'NEQUI': '1507',
  'bancolombia': '1007',
  'BANCOLOMBIA': '1007',
  'bbva': '1013',
  'BBVA': '1013',
  'davivienda': '1051',
  'DAVIVIENDA': '1051'
};

let BANKS_CACHE = null; // cache de respuesta de /banks

const isWompiConfigured = () => !!WOMPI_PRIVATE_KEY;

const isPayoutsConfigured = () => !!(WOMPI_API_KEY && WOMPI_USER_PRINCIPAL_ID);

function calculateFeeDistribution(amount, platformPercentage = PLATFORM_FEE_PERCENT, wompiPercentage = WOMPI_FEE_PERCENT, wompiFixed = WOMPI_FIXED_FEE) {
  const wompiFee = +(amount * wompiPercentage + wompiFixed).toFixed(2);
  const platformFee = +(amount * platformPercentage).toFixed(2);
  const teacherAmount = +(amount - wompiFee - platformFee).toFixed(2);
  return { wompiFee, platformFee, teacherAmount };
}

async function createTransaction({ amount, currency = 'COP', metadata = {} } = {}) {
  if (!isWompiConfigured()) {
    // modo simulación: retornar checkoutUrl falso
    return { checkoutUrl: `https://wompi.mock/checkout?amount=${amount}`, wompiTransactionId: `mock_${Date.now()}` };
  }

  const payload = {
    amount_in_cents: Math.round(amount * 100),
    currency,
    redirect_url: process.env.FRONTEND_URL + '/payment-success',
    customer_email: metadata.studentEmail || undefined,
    // metadata puede ser almacenado en reference
    reference: metadata.reference || `course_${metadata.courseId || 'unknown'}_${Date.now()}`,
  };

  const headers = {
    Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`
  };

  const res = await axios.post(`${BASE_URL}/transactions`, payload, { headers });
  if (res.data && res.data.data && res.data.data.checkout_url) {
    return { checkoutUrl: res.data.data.checkout_url, wompiTransactionId: res.data.data.id };
  }
  throw new Error('Wompi create transaction failed');
}

async function verifyTransaction(wompiTransactionId) {
  if (!isWompiConfigured()) {
    // simulación: success
    return { status: 'APPROVED', id: wompiTransactionId, amount_in_cents: 0 };
  }

  const headers = { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` };
  const res = await axios.get(`${BASE_URL}/transactions/${wompiTransactionId}`, { headers });
  if (res.data && res.data.data) return res.data.data;
  throw new Error('Wompi verify failed');
}

/**
 * Obtener bankId por nombre de banco
 */
function getBankId(bankName) {
  if (!bankName) return null;
  // Primero intentar mapping local
  const direct = BANK_IDS[bankName] || BANK_IDS[bankName.toUpperCase()];
  if (direct) return direct;
  // Si no está en mapping local, intentar buscar en cache de /banks (UUIDs esperados por Wompi)
  if (BANKS_CACHE && Array.isArray(BANKS_CACHE)) {
    const found = BANKS_CACHE.find(b => (b.name || '').toLowerCase().includes(bankName.toLowerCase()));
    if (found) return found.id;
  }
  return null;
}

async function fetchBanks() {
  if (!isPayoutsConfigured()) return null;
  if (BANKS_CACHE) return BANKS_CACHE;
  try {
    const headers = {
      'x-api-key': WOMPI_API_KEY,
      'user-principal-id': WOMPI_USER_PRINCIPAL_ID
    };
    const res = await axios.get(`${PAYOUTS_BASE_URL}/banks`, { headers });
    if (res.data && res.data.data) {
      BANKS_CACHE = res.data.data;
      return BANKS_CACHE;
    }
  } catch (err) {
    console.warn('Could not fetch banks list from Wompi payouts API:', err.message || err);
  }
  return null;
}

/**
 * Obtener cuentas (accountId) desde la API de payouts
 */
async function fetchAccounts() {
  if (!isPayoutsConfigured()) return null;
  try {
    const headers = {
      'x-api-key': WOMPI_API_KEY,
      'user-principal-id': WOMPI_USER_PRINCIPAL_ID
    };
    const res = await axios.get(`${PAYOUTS_BASE_URL}/accounts`, { headers });
    if (res.data && res.data.data) return res.data.data;
  } catch (err) {
    console.warn('Could not fetch accounts list from Wompi payouts API:', err.message || err);
  }
  return null;
}

/**
 * Crear payout (transferencia) desde cuenta Wompi de la plataforma al docente
 * Usa API de Pagos a Terceros de Wompi (POST /payouts)
 * @param {object} params
 * - amount (number): monto en COP
 * - currency (string): COP
 * - payoutInfo (object): {bankName, accountNumber, accountType, documentId, name, email}
 * - reference (string): referencia única
 * @returns {object} {wompiTransferId, status}
 */
async function createPayout({ amount, currency = 'COP', payoutInfo = {}, reference = '' } = {}) {
  if (!isPayoutsConfigured()) {
    // simulación: retornar ID falso
    console.log('[WOMPI SANDBOX] Simulating payout:', { amount, payoutInfo, reference });
    return {
      wompiTransferId: `mock_transfer_${Date.now()}`,
      status: 'PENDING',
      message: 'Payout simulado en modo sandbox'
    };
  }

  const { bankName, accountNumber, accountType, documentId, name, email, dispersionDatetime, paymentType } = payoutInfo;
  
  // Validaciones
  if (!bankName || !accountNumber || !documentId || !name || !email) {
    throw new Error('Información de payout incompleta: falta bankName, accountNumber, documentId, name o email');
  }

  // Obtener bankId (intentar mapping local y luego /banks)
  let bankId = getBankId(bankName);
  if (!bankId) {
    await fetchBanks();
    bankId = getBankId(bankName);
  }
  if (!bankId) {
    throw new Error(`Banco no soportado: ${bankName}. Consulta lista de bancos válidos.`);
  }

  // Determinar tipo de identificación (CC por defecto)
  const legalIdType = 'CC'; // Asume cédula de ciudadanía

  // Payload según documentación Wompi (note: paymentType va a nivel de lote)
  const payload = {
    reference: reference || `payout_${Date.now()}`,
    accountId: ACCOUNT_ID || process.env.WOMPI_ACCOUNT_ID || 'default',
    paymentType: paymentType || 'OTHER',
    // opcion de pagos programados
    ...(dispersionDatetime ? { dispersionDatetime } : {}),
    transactions: [
      {
        legalIdType,
        legalId: documentId,
        bankId,
        accountType: accountType === 'nequi' ? 'AHORROS' : (accountType === 'checking' ? 'CORRIENTE' : 'AHORROS'),
        accountNumber,
        name,
        email,
        amount: Math.round(amount * 100), // En centavos
        reference: reference || `transaction_${Date.now()}`
      }
    ]
  };

  const idempotencyKey = reference || `idemp_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  const headers = {
    'x-api-key': WOMPI_API_KEY,
    'user-principal-id': WOMPI_USER_PRINCIPAL_ID,
    'idempotency-key': idempotencyKey,
    'Content-Type': 'application/json'
  };

  try {
    // POST /payouts - crear lote de pago (usar host de payouts)
    const res = await axios.post(`${PAYOUTS_BASE_URL}/payouts`, payload, { headers });
    
    if (res.data && res.data.data) {
      const batchId = res.data.data.id;
      // Extraer primer transaction ID (en un lote individual será el único)
      const transactionId = res.data.data.transactions?.[0]?.id || batchId;
      
      return {
        wompiTransferId: transactionId,
        batchId: batchId,
        status: res.data.data.transactions?.[0]?.status || 'PENDING',
        responseData: res.data.data,
        idempotencyKey
      };
    }
    throw new Error('Wompi payout response malformed');
  } catch (err) {
    console.error('Wompi payout error:', err.response?.data || err.message);
    throw new Error(`Wompi payout failed: ${err.response?.data?.message || err.message}`);
  }
}

/**
 * Verificar estado de un payout (lote)
 */
async function verifyPayout(batchId) {
  if (!isPayoutsConfigured()) {
    return { status: 'PENDING', id: batchId };
  }

  const headers = {
    'x-api-key': WOMPI_API_KEY,
    'user-principal-id': WOMPI_USER_PRINCIPAL_ID
  };
  try {
    const res = await axios.get(`${PAYOUTS_BASE_URL}/payouts/${batchId}`, { headers });
    if (res.data && res.data.data) return res.data.data;
    throw new Error('Batch verification failed');
  } catch (err) {
    console.error('Wompi verify payout error:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = {
  isWompiConfigured,
  calculateFeeDistribution,
  createTransaction,
  verifyTransaction,
  createPayout,
  verifyPayout,
  fetchBanks,
  fetchAccounts
};
