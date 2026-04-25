const router  = require('express').Router();
const ctrl    = require('../controllers/chat.controller');
const { autenticar, soloAdultos } = require('../middlewares/auth');

// GET  /api/v1/chat             — Mensajes de un canal
router.get('/',            autenticar, soloAdultos, ctrl.listarMensajes);

// POST /api/v1/chat             — Enviar mensaje
router.post('/',           autenticar, soloAdultos, ctrl.enviarMensaje);

// GET  /api/v1/chat/experiencias — Experiencias destacadas
router.get('/experiencias', autenticar, soloAdultos, ctrl.experiencias);

// PUT  /api/v1/chat/:id         — Editar
router.put('/:id',         autenticar, soloAdultos, ctrl.editarMensaje);

// DELETE /api/v1/chat/:id       — Eliminar
router.delete('/:id',      autenticar, soloAdultos, ctrl.eliminarMensaje);

module.exports = router;
