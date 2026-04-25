/**
 * audio.controller.js — ConectaTEA v5
 * Gestión del sistema de audio TTS y archivos de audio pregrabados
 */
const path = require('path');
const fs   = require('fs');
const { Actividad, Nino, Progreso, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// ── GET /api/v1/audio/config/:nino_id ─────────────────────
// Devuelve la configuración de audio personalizada de un niño
const obtenerConfig = async (req, res) => {
  const nino = await Nino.findOne({
    where: { usuario_id: req.params.nino_id },
    attributes: [
      'audio_activo', 'audio_velocidad',
      'audio_leer_opciones', 'audio_repetir_pregunta',
      'tipo_comunicacion',
    ],
  });
  if (!nino) return res.status(404).json({ error: 'Niño no encontrado' });

  // Devolver config + sugerencia de velocidad según tipo de comunicación
  const velocidadSugerida = {
    'verbal':         0.9,
    'no_verbal':      0.65,   // más lento para no verbales
    'mixto_caa':      0.75,
    'caa_total':      0.65,
    'senas':          0.75,
  };

  res.json({
    config: {
      audio_activo:           nino.audio_activo,
      audio_velocidad:        nino.audio_velocidad,
      audio_leer_opciones:    nino.audio_leer_opciones,
      audio_repetir_pregunta: nino.audio_repetir_pregunta,
    },
    sugerencia_velocidad: velocidadSugerida[nino.tipo_comunicacion] || 0.82,
    tipo_comunicacion:    nino.tipo_comunicacion,
  });
};

// ── PUT /api/v1/audio/config/:nino_id ─────────────────────
// Actualizar preferencias de audio de un niño
const actualizarConfig = async (req, res) => {
  const {
    audio_activo, audio_velocidad,
    audio_leer_opciones, audio_repetir_pregunta,
  } = req.body;

  const nino = await Nino.findOne({ where: { usuario_id: req.params.nino_id } });
  if (!nino) return res.status(404).json({ error: 'Niño no encontrado' });

  const updates = {};
  if (audio_activo           !== undefined) updates.audio_activo           = audio_activo;
  if (audio_velocidad        !== undefined) updates.audio_velocidad        = Math.min(2, Math.max(0.3, audio_velocidad));
  if (audio_leer_opciones    !== undefined) updates.audio_leer_opciones    = audio_leer_opciones;
  if (audio_repetir_pregunta !== undefined) updates.audio_repetir_pregunta = audio_repetir_pregunta;

  await nino.update(updates);
  logger.info(`Audio config actualizada: niño ${req.params.nino_id}`);

  res.json({ mensaje: 'Preferencias de audio actualizadas', config: updates });
};

// ── POST /api/v1/audio/subir/:actividad_id ────────────────
// Subir un archivo de audio MP3 para una actividad específica
const subirAudio = async (req, res) => {
  const act = await Actividad.findByPk(req.params.actividad_id);
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });

  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo de audio' });

  // Verificar tipo de archivo
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (!['.mp3', '.ogg', '.wav', '.m4a'].includes(ext)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Solo se permiten archivos MP3, OGG, WAV o M4A' });
  }

  // Eliminar audio anterior si existía
  if (act.audio_url) {
    const oldPath = path.join(__dirname, '..', '..', act.audio_url.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath); } catch {}
    }
  }

  const audioUrl = `/uploads/audios/${req.file.filename}`;
  await act.update({ audio_url: audioUrl });

  logger.info(`Audio subido: ${audioUrl} → actividad ${act.id}`);
  res.json({
    mensaje: 'Audio subido correctamente',
    audio_url: audioUrl,
    actividad_id: act.id,
  });
};

// ── PUT /api/v1/audio/instruccion/:actividad_id ───────────
// Actualizar el texto TTS de una actividad
const actualizarInstruccion = async (req, res) => {
  const { audio_instruccion, tts_habilitado, tts_leer_opciones, velocidad_audio } = req.body;
  const act = await Actividad.findByPk(req.params.actividad_id);
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });

  const updates = {};
  if (audio_instruccion !== undefined) updates.audio_instruccion = audio_instruccion;
  if (tts_habilitado    !== undefined) updates.tts_habilitado    = tts_habilitado;
  if (tts_leer_opciones !== undefined) updates.tts_leer_opciones = tts_leer_opciones;
  if (velocidad_audio   !== undefined) updates.velocidad_audio   = velocidad_audio;

  await act.update(updates);
  res.json({ mensaje: 'Instrucción de audio actualizada', actividad: { id: act.id, ...updates } });
};

// ── GET /api/v1/audio/estadisticas/:nino_id ───────────────
// Estadísticas de uso de audio de un niño
const estadisticasAudio = async (req, res) => {
  const { nino_id } = req.params;
  const { desde, hasta } = req.query;

  const where = { nino_id };
  if (desde || hasta) {
    where.fecha = {};
    if (desde) where.fecha[Op.gte] = new Date(desde);
    if (hasta) where.fecha[Op.lte] = new Date(hasta);
  }

  const progresos = await Progreso.findAll({
    where,
    attributes: ['uso_audio', 'veces_repitio', 'velocidad_usada', 'puntuacion', 'completada'],
  });

  if (!progresos.length) {
    return res.json({ mensaje: 'Sin datos de audio aún', estadisticas: null });
  }

  const conAudio    = progresos.filter(p => p.uso_audio);
  const sinAudio    = progresos.filter(p => !p.uso_audio);
  const totalRepets = progresos.reduce((s, p) => s + (p.veces_repitio || 0), 0);

  const pctCompConAudio  = conAudio.length
    ? Math.round(conAudio.filter(p => p.completada).length / conAudio.length * 100) : 0;
  const pctCompSinAudio  = sinAudio.length
    ? Math.round(sinAudio.filter(p => p.completada).length / sinAudio.length * 100) : 0;

  const velocidades = progresos.filter(p => p.velocidad_usada).map(p => p.velocidad_usada);
  const velPromedio = velocidades.length
    ? (velocidades.reduce((s, v) => s + v, 0) / velocidades.length).toFixed(2) : null;

  res.json({
    estadisticas: {
      total_actividades:         progresos.length,
      actividades_con_audio:     conAudio.length,
      actividades_sin_audio:     sinAudio.length,
      porcentaje_uso_audio:      Math.round(conAudio.length / progresos.length * 100),
      promedio_repeticiones:     totalRepets ? (totalRepets / progresos.length).toFixed(1) : 0,
      completadas_con_audio_pct: pctCompConAudio,
      completadas_sin_audio_pct: pctCompSinAudio,
      velocidad_promedio:        velPromedio,
      // Insight: ¿el audio mejora el rendimiento?
      audio_mejora_rendimiento:  pctCompConAudio > pctCompSinAudio,
    },
  });
};

// ── GET /api/v1/audio/actividad/:id ───────────────────────
// Obtener config de audio de una actividad (para el frontend)
const obtenerConfigActividad = async (req, res) => {
  const act = await Actividad.findByPk(req.params.id, {
    attributes: [
      'id', 'titulo', 'descripcion', 'audio_url',
      'audio_instruccion', 'tts_habilitado', 'tts_leer_opciones', 'velocidad_audio',
    ],
  });
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });

  // Si no tiene instrucción personalizada, usar la descripción
  const instruccionFinal = act.audio_instruccion || act.descripcion || act.titulo;

  res.json({
    audio: {
      url:             act.audio_url,
      instruccion:     instruccionFinal,
      tts_habilitado:  act.tts_habilitado,
      leer_opciones:   act.tts_leer_opciones,
      velocidad:       act.velocidad_audio,
    },
  });
};

// ── DELETE /api/v1/audio/:actividad_id ────────────────────
// Eliminar el audio pregrabado de una actividad
const eliminarAudio = async (req, res) => {
  const act = await Actividad.findByPk(req.params.actividad_id);
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });

  if (act.audio_url) {
    const filePath = path.join(__dirname, '..', '..', act.audio_url.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { logger.warn('No se pudo borrar el archivo:', e.message); }
    }
    await act.update({ audio_url: null });
  }

  res.json({ mensaje: 'Audio eliminado. Se usará TTS automático.' });
};

module.exports = {
  obtenerConfig,
  actualizarConfig,
  subirAudio,
  actualizarInstruccion,
  estadisticasAudio,
  obtenerConfigActividad,
  eliminarAudio,
};
