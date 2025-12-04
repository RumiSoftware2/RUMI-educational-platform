const axios = require('axios');
const Payment = require('../models/Payment');

const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const BASE_URL = 'https://sandbox.wompi.co/v1';

const isWompiConfigured = () => !!WOMPI_PRIVATE_KEY;

function calculateFeeDistribution(amount, platformPercentage = 0.10, wompiPercentage = 0.0, wompiFixed = 0) {
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

module.exports = {
  isWompiConfigured,
  calculateFeeDistribution,
  createTransaction,
  verifyTransaction
};
