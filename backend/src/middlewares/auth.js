/**
 * Middleware de autenticación JWT
 * Los niños NO necesitan token (acceso libre)
 */
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Verifica token JWT obligatorio
 */
const autenticar = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    req.usuario = usuario;
    req.usuarioId = usuario.id;
    req.rol = usuario.rol;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', expired: true });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Token opcional — si viene lo valida, si no, continúa
 * Útil para rutas públicas con info extra para autenticados
 */
const autenticarOpcional = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return next();
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findByPk(decoded.id);
    if (usuario && usuario.activo) {
      req.usuario = usuario;
      req.usuarioId = usuario.id;
      req.rol = usuario.rol;
    }
    next();
  } catch {
    next(); // token inválido → continuar sin usuario
  }
};

/**
 * Requiere rol específico o lista de roles
 * Uso: autorizar('terapeuta') o autorizar(['terapeuta','docente'])
 */
const autorizar = (...roles) => (req, res, next) => {
  const rolesPermitidos = roles.flat();
  if (!req.usuario) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({
      error: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
    });
  }
  next();
};

/**
 * Solo profesionales (terapeuta o docente)
 */
const soloProfesionales = autorizar('terapeuta', 'docente', 'admin');

/**
 * Solo adultos (padre, terapeuta, docente, admin)
 */
const soloAdultos = autorizar('padre', 'terapeuta', 'docente', 'admin');

module.exports = { autenticar, autenticarOpcional, autorizar, soloProfesionales, soloAdultos };
