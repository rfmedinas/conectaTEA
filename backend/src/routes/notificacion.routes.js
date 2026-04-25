const router = require('express').Router();
const { notificacion: ctrl } = require('../controllers/otros.controller');
const { autenticar } = require('../middlewares/auth');

// GET    /api/v1/notificaciones       — Mis notificaciones
router.get('/',           autenticar, ctrl.listarNotificaciones);

// PATCH  /api/v1/notificaciones/todas — Marcar todas como leídas
router.patch('/todas',    autenticar, ctrl.marcarTodasLeidas);

// PATCH  /api/v1/notificaciones/:id   — Marcar una como leída
router.patch('/:id',      autenticar, ctrl.marcarLeida);

// DELETE /api/v1/notificaciones/:id   — Eliminar
router.delete('/:id',     autenticar, ctrl.eliminarNotificacion);

module.exports = router;
