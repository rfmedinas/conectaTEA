const router  = require('express').Router();
const ctrl    = require('../controllers/material.controller');
const { autenticar, autenticarOpcional, soloProfesionales, soloAdultos } = require('../middlewares/auth');
const { subirMaterial } = require('../middlewares/upload');
const rateLimiter = require('../middlewares/rateLimiter');

// GET  /api/v1/material             — Listar (cualquiera)
router.get('/',           autenticarOpcional,                ctrl.listar);

// POST /api/v1/material             — Subir (solo profesionales)
router.post('/',
  autenticar, soloProfesionales,
  rateLimiter.uploads,
  subirMaterial,
  ctrl.subir
);

// GET  /api/v1/material/:id/descargar — Descargar archivo
router.get('/:id/descargar', autenticar, soloAdultos,        ctrl.descargar);

// PUT  /api/v1/material/:id         — Actualizar meta
router.put('/:id',        autenticar, soloProfesionales,     ctrl.actualizar);

// DELETE /api/v1/material/:id       — Eliminar
router.delete('/:id',     autenticar, soloProfesionales,     ctrl.eliminar);

module.exports = router;
