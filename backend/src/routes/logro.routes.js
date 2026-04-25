const router = require('express').Router();
const { logro: ctrl } = require('../controllers/otros.controller');
const { autenticarOpcional, autenticar, autorizar } = require('../middlewares/auth');

// GET  /api/v1/logros               — Catálogo completo (público)
router.get('/',                autenticarOpcional, ctrl.listarLogros);

// GET  /api/v1/logros/mis/:nino_id  — Logros de un niño
router.get('/mis/:nino_id',    autenticar, ctrl.misLogros);

// GET  /api/v1/logros/mis           — Logros propios (niño autenticado)
router.get('/mis',             autenticar, ctrl.misLogros);

// POST /api/v1/logros               — Crear logro (admin)
router.post('/',               autenticar, autorizar('admin'), ctrl.crearLogro);

module.exports = router;
