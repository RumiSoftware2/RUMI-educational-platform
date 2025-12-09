const cron = require('node-cron');
const Payment = require('../models/Payment');
const User = require('../models/User');
const wompiService = require('./wompiService');

// Reintenta payouts fallidos cada hora
cron.schedule('0 * * * *', async () => {
  console.log('[PAYOUT-RETRY] Running payout retry job');
  try {
    // Buscar pagos completados con payoutStatus = 'FAILED'
    const failedPayments = await Payment.find({ payoutStatus: 'FAILED' }).limit(20);
    for (const payment of failedPayments) {
      try {
        const courseTeacher = await User.findById(payment.metadata?.teacherId || payment.teacher);
        if (!courseTeacher) {
          console.log('[PAYOUT-RETRY] Teacher not found for payment', payment._id);
          continue;
        }
        const teacher = courseTeacher;
        if (teacher.payoutInfo && teacher.payoutInfo.accountNumber && teacher.payoutInfo.documentId && teacher.name && teacher.email) {
          console.log('[PAYOUT-RETRY] Attempting payout for payment', payment._id);
          const payoutResult = await wompiService.createPayout({
            amount: payment.teacherAmount || 0,
            currency: payment.currency || 'COP',
            payoutInfo: { ...teacher.payoutInfo, name: teacher.name, email: teacher.email },
            reference: `retry_payment_${payment._id}`
          });
          payment.wompiTransferId = payoutResult.wompiTransferId;
          payment.batchId = payoutResult.batchId;
          payment.payoutStatus = payoutResult.status || 'PENDING';
          payment.payoutError = null;
          await payment.save();
          console.log('[PAYOUT-RETRY] Payout retried successfully for', payment._id);
        } else {
          console.log('[PAYOUT-RETRY] Teacher payoutInfo incomplete for', payment._id);
        }
      } catch (err) {
        console.error('[PAYOUT-RETRY] Error retrying payout for', payment._id, err.message || err);
        payment.payoutError = err.message || String(err);
        payment.payoutStatus = 'FAILED';
        await payment.save();
      }
    }
  } catch (err) {
    console.error('[PAYOUT-RETRY] Job failed:', err.message || err);
  }
});

module.exports = {};
