const { validationResult } = require('express-validator');

/**
 * Ejecuta las reglas de validación y devuelve errores si los hay
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Datos de entrada inválidos',
      errores: errors.array().map(e => ({
        campo:   e.path || e.param,
        mensaje: e.msg,
        valor:   e.value,
      })),
    });
  }
  next();
};

module.exports = validate;
