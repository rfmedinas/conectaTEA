const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// POST /api/v1/auth/registro
router.post('/registro',
  ctrl.reglasRegistro,
  validate,
  ctrl.registrar
);

// POST /api/v1/auth/login
router.post('/login',
  ctrl.reglasLogin,
  validate,
  ctrl.login
);

// POST /api/v1/auth/refresh
router.post('/refresh', ctrl.refreshToken);

// GET  /api/v1/auth/me
router.get('/me', autenticar, ctrl.miPerfil);

// PUT  /api/v1/auth/cambiar-password
router.put('/cambiar-password', autenticar, ctrl.cambiarPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password',  ctrl.solicitarReset);

// POST /api/v1/auth/reset-password/confirmar
router.post('/reset-password/confirmar', ctrl.confirmarReset);

module.exports = router;
