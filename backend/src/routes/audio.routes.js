/**
 * audio.routes.js — ConectaTEA v5/v6
 * Rutas del sistema de audio TTS
 */
const router = require('express').Router();
const ctrl   = require('../controllers/audio.controller');
const { autenticar, autenticarOpcional, soloProfesionales } = require('../middlewares/auth');
const { subirAudio } = require('../middlewares/upload'); // ← desestructuración correcta

// ── Config de audio de un niño ────────────────────────────
router.get ('/config/:nino_id',  autenticar, ctrl.obtenerConfig);
router.put ('/config/:nino_id',  autenticar, ctrl.actualizarConfig);

// ── Config de audio de una actividad ──────────────────────
router.get ('/actividad/:id',    autenticarOpcional, ctrl.obtenerConfigActividad);

// ── Archivos de audio pregrabados (para profesionales) ────
router.post(
  '/subir/:actividad_id',
  autenticar, soloProfesionales,
  subirAudio,          // ← middleware ya configurado con .single('audio')
  ctrl.subirAudio
);

router.put   ('/instruccion/:actividad_id', autenticar, soloProfesionales, ctrl.actualizarInstruccion);
router.delete('/:actividad_id',             autenticar, soloProfesionales, ctrl.eliminarAudio);

// ── Estadísticas de uso de audio ──────────────────────────
router.get ('/estadisticas/:nino_id', autenticar, ctrl.estadisticasAudio);

module.exports = router;
