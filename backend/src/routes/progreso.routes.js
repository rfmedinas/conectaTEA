const router = require('express').Router();
const { progreso: ctrl } = require('../controllers/otros.controller');
const { autenticar, soloAdultos } = require('../middlewares/auth');

router.get('/resumen/:nino_id', autenticar, soloAdultos, ctrl.resumenProgreso);

module.exports = router;
