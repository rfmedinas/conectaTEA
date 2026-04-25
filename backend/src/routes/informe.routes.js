const router = require('express').Router();
const ctrl   = require('../controllers/informe.controller');
const { autenticar, soloProfesionales, soloAdultos } = require('../middlewares/auth');

// GET  /api/v1/informes             — Listar (profesionales ven los suyos, padres ven los de sus hijos)
router.get('/',           autenticar, soloAdultos,        ctrl.listar);

// POST /api/v1/informes             — Crear
router.post('/',          autenticar, soloProfesionales,  ctrl.crear);

// PUT  /api/v1/informes/:id         — Actualizar
router.put('/:id',        autenticar, soloProfesionales,  ctrl.actualizar);

// DELETE /api/v1/informes/:id       — Eliminar
router.delete('/:id',     autenticar, soloProfesionales,  ctrl.eliminar);

// GET  /api/v1/informes/:id/pdf     — Descargar PDF (profesionales y familias)
router.get('/:id/pdf',    autenticar, soloAdultos,        ctrl.descargarPDF);

// POST /api/v1/informes/:id/enviar  — Enviar a familia
router.post('/:id/enviar',autenticar, soloProfesionales,  ctrl.enviarFamilia);

module.exports = router;
