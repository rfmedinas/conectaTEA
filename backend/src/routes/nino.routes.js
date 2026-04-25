const router = require('express').Router();
const ctrl   = require('../controllers/nino.controller');
const { autenticar, soloAdultos } = require('../middlewares/auth');

// Todos los endpoints requieren autenticación de adulto

// GET  /api/v1/ninos              — Mis niños
router.get('/',           autenticar, soloAdultos, ctrl.misNinos);

// POST /api/v1/ninos              — Crear niño
router.post('/',          autenticar, soloAdultos, ctrl.crearNino);

// GET  /api/v1/ninos/:id          — Detalle
router.get('/:id',        autenticar, soloAdultos, ctrl.obtenerNino);

// PUT  /api/v1/ninos/:id          — Actualizar
router.put('/:id',        autenticar, soloAdultos, ctrl.actualizarNino);

// GET  /api/v1/ninos/:id/progreso — Progreso completo por área
router.get('/:id/progreso', autenticar, soloAdultos, ctrl.progresoNino);

// DELETE /api/v1/ninos/:id/relacion — Desvincular (no borra al niño)
router.delete('/:id/relacion', autenticar, soloAdultos, ctrl.eliminarRelacion);

module.exports = router;
