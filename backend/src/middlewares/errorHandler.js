/**
 * Manejador global de errores
 */
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  // Error de validación Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errores = err.errors.map(e => ({ campo: e.path, mensaje: e.message }));
    return res.status(422).json({ error: 'Datos inválidos', errores });
  }
  // Error de unicidad
  if (err.name === 'SequelizeUniqueConstraintError') {
    const campo = err.errors[0]?.path || 'campo';
    return res.status(409).json({ error: `El ${campo} ya está registrado` });
  }
  // Error de FK
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Referencia inválida a un recurso inexistente' });
  }
  // Multer — archivo demasiado grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `Archivo demasiado grande. Máximo ${process.env.MAX_FILE_SIZE_MB || 20}MB` });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Campo de archivo inesperado' });
  }

  const status = err.status || err.statusCode || 500;
  const mensaje = process.env.NODE_ENV === 'production' && status === 500
    ? 'Error interno del servidor'
    : err.message;

  res.status(status).json({ error: mensaje });
};

module.exports = errorHandler;
