const router = require('express').Router();
const ctrl   = require('../controllers/actividad.controller');
const { autenticar, autenticarOpcional, soloProfesionales } = require('../middlewares/auth');

// GET  /api/v1/actividades
// Query params: area_id, tipo, nivel, subcarpeta, destacada, page, limit
router.get('/',         autenticarOpcional, ctrl.listar);

// GET  /api/v1/actividades/por-area/:slug
// Devuelve todas las actividades de un área, agrupadas por nivel y subcarpeta
router.get('/por-area/:slug', autenticarOpcional, ctrl.listarPorArea);

// GET  /api/v1/actividades/:id
router.get('/:id',      autenticarOpcional, ctrl.obtener);

// POST /api/v1/actividades  — Crear (profesionales)
router.post('/',        autenticar, soloProfesionales, ctrl.crear);

// PUT  /api/v1/actividades/:id
router.put('/:id',      autenticar, soloProfesionales, ctrl.actualizar);

// DELETE /api/v1/actividades/:id
router.delete('/:id',   autenticar, soloProfesionales, ctrl.eliminar);

// POST /api/v1/actividades/completar
router.post('/completar', autenticarOpcional, ctrl.completar);

// GET  /api/v1/actividades/historial/:nino_id
router.get('/historial/:nino_id', autenticar, ctrl.historialProgreso);

module.exports = router;
