const BankAccount = require('../models/BankAccount');
const User = require('../models/User');

// Crear o actualizar cuenta bancaria del docente
const createOrUpdateBankAccount = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { accountHolder, accountNumber, accountType, bankName, bankCode, routingNumber, country } = req.body;

    // Validar campos requeridos
    if (!accountHolder || !accountNumber || !accountType || !bankName || !bankCode || !routingNumber) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Validar que sea docente
    const user = await User.findById(teacherId);
    if (user.role !== 'docente' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los docentes pueden tener cuentas bancarias' });
    }

    let bankAccount = await BankAccount.findOne({ teacher: teacherId });

    if (!bankAccount) {
      // Crear nueva cuenta bancaria
      bankAccount = new BankAccount({
        teacher: teacherId,
        accountHolder,
        accountNumber,
        accountType,
        bankName,
        bankCode,
        routingNumber,
        country: country || 'CO'
      });
    } else {
      // Actualizar cuenta existente
      bankAccount.accountHolder = accountHolder;
      bankAccount.accountNumber = accountNumber;
      bankAccount.accountType = accountType;
      bankAccount.bankName = bankName;
      bankAccount.bankCode = bankCode;
      bankAccount.routingNumber = routingNumber;
      if (country) bankAccount.country = country;
      bankAccount.updatedAt = new Date();
    }

    await bankAccount.save();

    res.status(201).json({
      message: 'Cuenta bancaria guardada exitosamente',
      bankAccount
    });
  } catch (error) {
    console.error('Error al guardar cuenta bancaria:', error);
    res.status(500).json({ message: 'Error al guardar cuenta bancaria', error: error.message });
  }
};

// Obtener cuenta bancaria del docente
const getBankAccount = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const bankAccount = await BankAccount.findOne({ teacher: teacherId });

    if (!bankAccount) {
      return res.status(404).json({ message: 'Cuenta bancaria no encontrada' });
    }

    // No retornar datos sensibles
    const safeAccount = {
      _id: bankAccount._id,
      accountHolder: bankAccount.accountHolder,
      accountType: bankAccount.accountType,
      bankName: bankAccount.bankName,
      country: bankAccount.country,
      isVerified: bankAccount.isVerified,
      totalEarnings: bankAccount.totalEarnings,
      pendingPayouts: bankAccount.pendingPayouts,
      lastPayout: bankAccount.lastPayout,
      createdAt: bankAccount.createdAt,
      updatedAt: bankAccount.updatedAt,
      // Mostrar últimos 4 dígitos de la cuenta
      accountNumberLast4: bankAccount.accountNumber.slice(-4)
    };

    res.status(200).json(safeAccount);
  } catch (error) {
    console.error('Error al obtener cuenta bancaria:', error);
    res.status(500).json({ message: 'Error al obtener cuenta bancaria', error: error.message });
  }
};

// Verificar cuenta bancaria (validar con el banco)
const verifyBankAccount = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { verificationAmount } = req.body;

    const bankAccount = await BankAccount.findOne({ teacher: teacherId });
    if (!bankAccount) {
      return res.status(404).json({ message: 'Cuenta bancaria no encontrada' });
    }

    // Generar código de verificación (6 dígitos)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    bankAccount.verificationCode = verificationCode;
    bankAccount.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    bankAccount.verificationAttempts = 0;

    await bankAccount.save();

    // TODO: Enviar el código de verificación al correo del docente
    console.log(`Código de verificación enviado: ${verificationCode}`);

    res.status(200).json({
      message: 'Código de verificación enviado a tu correo',
      verificationCodeSent: true
    });
  } catch (error) {
    console.error('Error al verificar cuenta bancaria:', error);
    res.status(500).json({ message: 'Error al verificar cuenta bancaria', error: error.message });
  }
};

// Confirmar verificación de cuenta bancaria
const confirmBankAccountVerification = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({ message: 'Código de verificación requerido' });
    }

    const bankAccount = await BankAccount.findOne({ teacher: teacherId });
    if (!bankAccount) {
      return res.status(404).json({ message: 'Cuenta bancaria no encontrada' });
    }

    // Validar que el código no haya expirado
    if (!bankAccount.verificationExpires || bankAccount.verificationExpires < new Date()) {
      return res.status(400).json({ message: 'Código de verificación expirado' });
    }

    // Validar intentos
    if (bankAccount.verificationAttempts >= 3) {
      return res.status(400).json({ message: 'Demasiados intentos fallidos. Solicita uno nuevo' });
    }

    // Verificar código
    if (bankAccount.verificationCode !== verificationCode) {
      bankAccount.verificationAttempts += 1;
      await bankAccount.save();
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    // Marcar como verificada
    bankAccount.isVerified = true;
    bankAccount.verificationCode = null;
    bankAccount.verificationExpires = null;
    bankAccount.verificationAttempts = 0;

    await bankAccount.save();

    res.status(200).json({
      message: 'Cuenta bancaria verificada exitosamente',
      bankAccount
    });
  } catch (error) {
    console.error('Error al confirmar verificación:', error);
    res.status(500).json({ message: 'Error al confirmar verificación', error: error.message });
  }
};

// Obtener estado de payouts del docente
const getPayoutStatus = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const bankAccount = await BankAccount.findOne({ teacher: teacherId });
    if (!bankAccount) {
      return res.status(404).json({ message: 'Cuenta bancaria no encontrada' });
    }

    res.status(200).json({
      totalEarnings: bankAccount.totalEarnings,
      pendingPayouts: bankAccount.pendingPayouts,
      lastPayout: bankAccount.lastPayout,
      isVerified: bankAccount.isVerified
    });
  } catch (error) {
    console.error('Error al obtener estado de payouts:', error);
    res.status(500).json({ message: 'Error al obtener estado de payouts', error: error.message });
  }
};

// Solicitar payout (solo disponible si la cuenta está verificada)
const requestPayout = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Monto inválido' });
    }

    const bankAccount = await BankAccount.findOne({ teacher: teacherId });
    if (!bankAccount) {
      return res.status(404).json({ message: 'Cuenta bancaria no encontrada' });
    }

    if (!bankAccount.isVerified) {
      return res.status(400).json({ message: 'Tu cuenta bancaria debe estar verificada para solicitar payouts' });
    }

    if (amount > bankAccount.pendingPayouts) {
      return res.status(400).json({ message: 'Monto solicitado supera los pendientes de pagar' });
    }

    // Registrar el payout solicitado
    bankAccount.pendingPayouts -= amount;
    bankAccount.lastPayout = new Date();

    await bankAccount.save();

    res.status(200).json({
      message: 'Payout solicitado exitosamente',
      payout: {
        amount,
        requestedAt: new Date(),
        status: 'processing'
      }
    });
  } catch (error) {
    console.error('Error al solicitar payout:', error);
    res.status(500).json({ message: 'Error al solicitar payout', error: error.message });
  }
};

module.exports = {
  createOrUpdateBankAccount,
  getBankAccount,
  verifyBankAccount,
  confirmBankAccountVerification,
  getPayoutStatus,
  requestPayout
};
