// src/routes/video.routes.js — ConectaTEA v6
const router = require('express').Router();
const ctrl   = require('../controllers/video.controller');
const { autenticar, autenticarOpcional, soloProfesionales } = require('../middlewares/auth');

// Públicas (autenticación opcional — para PWA offline)
router.get('/categorias',            autenticarOpcional, ctrl.categorias);
router.get('/recomendados/:nino_id', autenticar,         ctrl.recomendados);
router.get('/historial/:nino_id',    autenticar,         ctrl.historial);
router.get('/',                      autenticarOpcional, ctrl.listar);
router.get('/:id',                   autenticarOpcional, ctrl.obtener);

// Registro de vista (niño)
router.post('/:id/visto', autenticar, ctrl.registrarVisto);

// Gestión (profesionales)
router.post  ('/',     autenticar, soloProfesionales, ctrl.crear);
router.put   ('/:id',  autenticar, soloProfesionales, ctrl.actualizar);
router.delete('/:id',  autenticar, soloProfesionales, ctrl.eliminar);

module.exports = router;
