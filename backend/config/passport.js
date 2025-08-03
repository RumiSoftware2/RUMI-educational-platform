const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

// Configurar estrategia JWT
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Configurar estrategia de Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'https://rumi-backend.onrender.com'}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Buscar usuario existente por googleId
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Buscar usuario por email (en caso de que ya se haya registrado con email)
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Si existe usuario con ese email, actualizar con googleId
      user.googleId = profile.id;
      user.authProvider = 'google';
      user.emailVerified = true; // Google ya verifica el email
      await user.save();
      return done(null, user);
    }
    
    // Crear nuevo usuario
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      authProvider: 'google',
      emailVerified: true, // Google ya verifica el email
      role: 'estudiante' // Por defecto
    });
    
    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport; 