/**
 * Auth Controller — ConectaTEA
 * Registro · Login · Refresh token · Logout · Reset password
 */
const jwt      = require('jsonwebtoken');
const crypto   = require('crypto');
const { body } = require('express-validator');
const { Usuario, Nino, Notificacion } = require('../models');
const { emitirNotificacion } = require('../config/socket');
const logger   = require('../config/logger');

// ── Helpers ──────────────────────────────────────
function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
function generarRefresh(usuario) {
  return jwt.sign(
    { id: usuario.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
}

// ── Validaciones ─────────────────────────────────
const reglasRegistro = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido').isLength({ min: 2, max: 80 }),
  body('apellido').trim().notEmpty().withMessage('Apellido requerido').isLength({ min: 2, max: 80 }),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  body('rol').isIn(['padre','terapeuta','docente']).withMessage('Rol inválido'),
];

const reglasLogin = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida'),
];

// ── Registro ─────────────────────────────────────
const registrar = async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;

  const existe = await Usuario.findOne({ where: { email } });
  if (existe) return res.status(409).json({ error: 'El email ya está registrado' });

  const tokenVerif = crypto.randomBytes(32).toString('hex');

  const usuario = await Usuario.create({
    nombre, apellido, email,
    password_hash: password,
    rol,
    token_verificacion: tokenVerif,
    email_verificado: process.env.NODE_ENV === 'development', // auto-verificar en dev
  });

  // Notificación de bienvenida
  await Notificacion.create({
    usuario_id: usuario.id,
    tipo:    'sistema',
    titulo:  '¡Bienvenido/a a ConectaTEA! 🎉',
    mensaje: `Hola ${nombre}, tu cuenta ha sido creada. ¡Empecemos juntos!`,
    emoji:   '🧩',
  });

  logger.info(`Nuevo usuario registrado: ${email} [${rol}]`);

  const token   = generarToken(usuario);
  const refresh = generarRefresh(usuario);

  res.status(201).json({
    mensaje: 'Cuenta creada con éxito',
    token,
    refresh_token: refresh,
    usuario: usuario.toJSON(),
  });
};

// ── Login ─────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  const usuario = await Usuario.findOne({ where: { email, activo: true } });
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const ok = await usuario.verificarPassword(password);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  await usuario.update({ ultimo_login: new Date() });

  const token   = generarToken(usuario);
  const refresh = generarRefresh(usuario);

  logger.info(`Login exitoso: ${email} [${usuario.rol}]`);

  res.json({
    mensaje: 'Sesión iniciada',
    token,
    refresh_token: refresh,
    usuario: usuario.toJSON(),
  });
};

// ── Refresh token ─────────────────────────────────
const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token requerido' });

  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    const nuevoToken = generarToken(usuario);
    res.json({ token: nuevoToken });
  } catch {
    res.status(401).json({ error: 'Refresh token inválido o expirado' });
  }
};

// ── Perfil propio ─────────────────────────────────
const miPerfil = async (req, res) => {
  res.json({ usuario: req.usuario.toJSON() });
};

// ── Cambiar contraseña ────────────────────────────
const cambiarPassword = async (req, res) => {
  const { password_actual, password_nueva } = req.body;
  const ok = await req.usuario.verificarPassword(password_actual);
  if (!ok) return res.status(401).json({ error: 'Contraseña actual incorrecta' });
  await req.usuario.update({ password_hash: password_nueva });
  res.json({ mensaje: 'Contraseña actualizada' });
};

// ── Solicitar reset password ──────────────────────
const solicitarReset = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ where: { email } });
  // Siempre responder igual (evitar enumeración)
  if (!usuario) return res.json({ mensaje: 'Si el email existe, recibirás instrucciones' });

  const token  = crypto.randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  await usuario.update({ token_reset: token, token_reset_expira: expira });

  // TODO: enviar email real con nodemailer
  logger.info(`Reset password solicitado para: ${email} | token: ${token}`);
  res.json({ mensaje: 'Si el email existe, recibirás instrucciones' });
};

// ── Confirmar reset password ──────────────────────
const confirmarReset = async (req, res) => {
  const { token, password_nueva } = req.body;
  const usuario = await Usuario.findOne({
    where: { token_reset: token },
  });
  if (!usuario || !usuario.token_reset_expira || new Date() > usuario.token_reset_expira) {
    return res.status(400).json({ error: 'Token inválido o expirado' });
  }
  await usuario.update({
    password_hash: password_nueva,
    token_reset: null,
    token_reset_expira: null,
  });
  res.json({ mensaje: 'Contraseña actualizada con éxito' });
};

module.exports = {
  reglasRegistro,
  reglasLogin,
  registrar,
  login,
  refreshToken,
  miPerfil,
  cambiarPassword,
  solicitarReset,
  confirmarReset,
};
