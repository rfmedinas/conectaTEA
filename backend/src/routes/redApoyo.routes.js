const router = require('express').Router();
const ctrl   = require('../controllers/redApoyo.controller');
const { autenticar, autenticarOpcional, autorizar } = require('../middlewares/auth');

// GET    /api/v1/red-apoyo          — Listar (público)
router.get('/',       autenticarOpcional, ctrl.listar);

// GET    /api/v1/red-apoyo/:id      — Detalle
router.get('/:id',    autenticarOpcional, ctrl.obtener);

// POST   /api/v1/red-apoyo          — Crear (profesionales o admin)
router.post('/',      autenticar, autorizar('terapeuta','docente','admin','padre'), ctrl.crear);

// PUT    /api/v1/red-apoyo/:id      — Actualizar
router.put('/:id',    autenticar, autorizar('admin'), ctrl.actualizar);

// PATCH  /api/v1/red-apoyo/:id/verificar — Verificar (admin)
router.patch('/:id/verificar', autenticar, autorizar('admin'), ctrl.verificar);

// DELETE /api/v1/red-apoyo/:id      — Eliminar
router.delete('/:id', autenticar, autorizar('admin'), ctrl.eliminar);

module.exports = router;
