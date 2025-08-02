const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Verificar si Stripe está configurado
  isStripeConfigured() {
    return process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_');
  }

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
      if (!this.isStripeConfigured()) {
        // Modo de prueba sin Stripe
        console.log('⚠️ Stripe no configurado - usando modo de prueba');
        return {
          id: `pi_test_${Date.now()}`,
          client_secret: `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
          status: 'requires_payment_method',
          amount: Math.round(amount * 100),
          currency,
          metadata
        };
      }

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
      if (!this.isStripeConfigured()) {
        // Modo de prueba sin Stripe
        console.log('⚠️ Stripe no configurado - simulando pago exitoso');
        const amount = 29.99; // Precio fijo para testing
        const feeDistribution = this.calculateFeeDistribution(amount);
        
        return {
          success: true,
          amount,
          feeDistribution,
          transferId: `tr_test_${Date.now()}`,
          paymentIntent: {
            id: paymentIntentId,
            status: 'succeeded',
            amount: Math.round(amount * 100)
          }
        };
      }

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
      if (!this.isStripeConfigured()) {
        // Modo de prueba sin Stripe
        console.log('⚠️ Stripe no configurado - simulando cuenta de docente');
        return {
          id: `acct_test_${Date.now()}`,
          type: 'express',
          country: 'US',
          email: teacherEmail,
          status: 'pending'
        };
      }

      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Ajustar según el país
        email: teacherEmail,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          url: process.env.FRONTEND_URL || process.env.PLATFORM_URL,
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
      if (!this.isStripeConfigured()) {
        // Modo de prueba sin Stripe
        console.log('⚠️ Stripe no configurado - simulando link de onboarding');
        return {
          url: `${returnUrl}?test_mode=true&account_id=${accountId}`,
          expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        };
      }

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
      if (!this.isStripeConfigured()) {
        // Modo de prueba sin Stripe
        console.log('⚠️ Stripe no configurado - simulando balance');
        return {
          available: [{ amount: 100000, currency: 'usd' }],
          pending: [{ amount: 50000, currency: 'usd' }]
        };
      }

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
      if (!this.isStripeConfigured()) {
        // Modo de prueba sin Stripe
        console.log('⚠️ Stripe no configurado - simulando balance de docente');
        return {
          available: [{ amount: 50000, currency: 'usd' }],
          pending: [{ amount: 25000, currency: 'usd' }]
        };
      }

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