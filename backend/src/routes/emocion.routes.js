const router = require('express').Router();
const ctrl   = require('../controllers/emocion.controller');
const { autenticar, autenticarOpcional, autorizar } = require('../middlewares/auth');

// GET  /api/v1/emociones                  — Catálogo
router.get('/',                autenticarOpcional, ctrl.listar);

// POST /api/v1/emociones/registrar        — Registrar (niño/padre)
router.post('/registrar',      autenticarOpcional, ctrl.registrar);

// GET  /api/v1/emociones/historial/:id    — Historial del niño
router.get('/historial/:nino_id', autenticar, ctrl.historial);

// POST /api/v1/emociones                  — Crear (admin)
router.post('/',               autenticar, autorizar('admin'), ctrl.crear);

// PUT  /api/v1/emociones/:id              — Actualizar (admin)
router.put('/:id',             autenticar, autorizar('admin'), ctrl.actualizar);

module.exports = router;
