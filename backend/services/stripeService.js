const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Calcular distribución de ganancias
  calculateFeeDistribution(amount, platformPercentage = 10) {
    const stripeFee = (amount * 0.029) + 0.30; // 2.9% + $0.30
    const platformFee = (amount * platformPercentage) / 100;
    const teacherAmount = amount - stripeFee - platformFee;
    
    return {
      stripeFee: Math.round(stripeFee * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      teacherAmount: Math.round(teacherAmount * 100) / 100
    };
  }

  // Crear Payment Intent
  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Confirmar pago y procesar distribución
  async confirmPayment(paymentIntentId, courseId, teacherId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const amount = paymentIntent.amount / 100; // Convertir de centavos
        const feeDistribution = this.calculateFeeDistribution(amount);
        
        // Transferir dinero al docente (si tiene cuenta Stripe conectada)
        let transferId = null;
        if (paymentIntent.metadata.teacherStripeAccountId) {
          const transfer = await stripe.transfers.create({
            amount: Math.round(feeDistribution.teacherAmount * 100),
            currency: 'usd',
            destination: paymentIntent.metadata.teacherStripeAccountId,
            description: `Pago por curso ${courseId}`,
          });
          transferId = transfer.id;
        }
        
        return {
          success: true,
          amount,
          feeDistribution,
          transferId,
          paymentIntent
        };
      }
      
      return {
        success: false,
        error: 'Payment not succeeded'
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  // Crear cuenta conectada para docente
  async createTeacherAccount(teacherEmail, teacherName) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Ajustar según el país
        email: teacherEmail,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          url: process.env.PLATFORM_URL,
        },
      });
      
      return account;
    } catch (error) {
      console.error('Error creating teacher account:', error);
      throw error;
    }
  }

  // Generar link de onboarding para docente
  async createOnboardingLink(accountId, returnUrl) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: returnUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });
      
      return accountLink;
    } catch (error) {
      console.error('Error creating onboarding link:', error);
      throw error;
    }
  }

  // Obtener balance de la plataforma
  async getPlatformBalance() {
    try {
      const balance = await stripe.balance.retrieve();
      return balance;
    } catch (error) {
      console.error('Error getting platform balance:', error);
      throw error;
    }
  }

  // Obtener balance de un docente
  async getTeacherBalance(teacherStripeAccountId) {
    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: teacherStripeAccountId,
      });
      return balance;
    } catch (error) {
      console.error('Error getting teacher balance:', error);
      throw error;
    }
  }
}

module.exports = new StripeService(); 