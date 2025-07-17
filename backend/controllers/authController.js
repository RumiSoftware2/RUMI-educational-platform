const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const { generateVerificationCode, sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// Registro con verificación de email
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validar formato de email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Correo electrónico inválido' });
    }

    // Evitar que se registren como admin desde el frontend
    if (role === 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para registrarte como administrador' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar código de verificación
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Crear nuevo usuario (sin verificar)
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires
    });

    await newUser.save();

    // Enviar email de verificación
    try {
      await sendVerificationEmail(email, verificationCode);
      res.status(201).json({ 
        message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
        requiresVerification: true
      });
    } catch (emailError) {
      // Si falla el envío de email, eliminar el usuario
      await User.findByIdAndDelete(newUser._id);
      res.status(500).json({ message: 'Error al enviar email de verificación' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error });
  }
};

// Verificar código de email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'El email ya está verificado' });
    }

    if (user.emailVerificationCode !== code) {
      return res.status(400).json({ message: 'Código de verificación incorrecto' });
    }

    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'El código de verificación ha expirado' });
    }

    // Marcar email como verificado
    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.status(200).json({ message: 'Email verificado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar email', error });
  }
};

// Reenviar código de verificación
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'El email ya está verificado' });
    }

    // Generar nuevo código
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Enviar nuevo email
    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({ message: 'Nuevo código de verificación enviado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al reenviar código', error });
  }
};

// Login (actualizado para verificar email)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar formato de email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Correo electrónico inválido' });
    }

    // Buscar al usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparar contraseñas
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Verificar si el email está verificado
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Debes verificar tu email antes de iniciar sesión',
        requiresVerification: true
      });
    }

    // Generar token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Enviar también los datos del usuario
    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

// Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Enviar email de recuperación
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: 'Email de recuperación enviado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al procesar solicitud', error });
  }
};

// Resetear contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar contraseña', error });
  }
};

// Cambiar contraseña (usuario autenticado)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Viene del middleware de autenticación

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar contraseña', error });
  }
};
