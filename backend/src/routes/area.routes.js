const router = require('express').Router();
const { area: ctrl } = require('../controllers/otros.controller');
const { autenticarOpcional, autenticar, autorizar } = require('../middlewares/auth');

router.get('/',     autenticarOpcional, ctrl.listarAreas);
router.get('/:id',  autenticarOpcional, ctrl.obtenerArea);
router.post('/',    autenticar, autorizar('admin'), ctrl.crearArea);

module.exports = router;
