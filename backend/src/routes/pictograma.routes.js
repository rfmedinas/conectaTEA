const router = require('express').Router();
const { pictograma: ctrl } = require('../controllers/otros.controller');
const { autenticarOpcional, autenticar, autorizar } = require('../middlewares/auth');

// GET  /api/v1/pictogramas           — Listar (público)
router.get('/',    autenticarOpcional, ctrl.listarPictogramas);

// POST /api/v1/pictogramas           — Crear (admin)
router.post('/',   autenticar, autorizar('admin'), ctrl.crearPictograma);

// PUT  /api/v1/pictogramas/:id       — Actualizar (admin)
router.put('/:id', autenticar, autorizar('admin'), ctrl.actualizarPictograma);

module.exports = router;
