/**
 * Actividad Controller — ConectaTEA
 * CRUD actividades + completar + progreso
 */
const { Op } = require('sequelize');
const { Actividad, Area, Progreso, Nino, Logro, LogroUsuario,
        Notificacion, Usuario } = require('../models');
const { emitirNotificacion } = require('../config/socket');

// ── Listar actividades ────────────────────────────
const listar = async (req, res) => {
  const { area_id, tipo, nivel, destacada, page = 1, limit = 20 } = req.query;
  const where = { activa: true };

  if (area_id)   where.area_id   = area_id;
  if (tipo)      where.tipo      = tipo;
  if (nivel)     where.nivel     = nivel;
  if (destacada) where.destacada = destacada === 'true';

  const { rows, count } = await Actividad.findAndCountAll({
    where,
    include: [{ model: Area, as: 'area', attributes: ['id','nombre','slug','icono','color'] }],
    order: [['destacada','DESC'], ['createdAt','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    actividades: rows,
    total: count,
    pagina: parseInt(page),
    total_paginas: Math.ceil(count / parseInt(limit)),
  });
};

// ── Detalle de actividad ──────────────────────────
const obtener = async (req, res) => {
  const act = await Actividad.findByPk(req.params.id, {
    include: [{ model: Area, as: 'area' }],
  });
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });
  res.json({ actividad: act });
};

// ── Crear actividad (profesionales) ───────────────
const crear = async (req, res) => {
  const {
    titulo, descripcion, tipo, nivel, area_id,
    duracion_min, emoji, color_fondo, contenido, puntos_max, destacada,
  } = req.body;

  const act = await Actividad.create({
    titulo, descripcion, tipo, nivel, area_id,
    duracion_min: duracion_min || 10,
    emoji: emoji || '🎮',
    color_fondo: color_fondo || '#EBF1FF',
    contenido: contenido || [],
    puntos_max: puntos_max || 100,
    destacada: destacada || false,
    creado_por: req.usuarioId,
  });

  res.status(201).json({ mensaje: 'Actividad creada', actividad: act });
};

// ── Actualizar actividad ──────────────────────────
const actualizar = async (req, res) => {
  const act = await Actividad.findByPk(req.params.id);
  if (!act) return res.status(404).json({ error: 'No encontrada' });
  if (act.creado_por !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso para editar esta actividad' });
  }
  await act.update(req.body);
  res.json({ mensaje: 'Actualizada', actividad: act });
};

// ── Eliminar actividad ────────────────────────────
const eliminar = async (req, res) => {
  const act = await Actividad.findByPk(req.params.id);
  if (!act) return res.status(404).json({ error: 'No encontrada' });
  if (act.creado_por !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  await act.destroy();
  res.json({ mensaje: 'Actividad eliminada' });
};

// ── Completar actividad (registro de progreso) ────
const completar = async (req, res) => {
  const {
    actividad_id, nino_id, puntuacion, tiempo_seg, respuestas, nivel_jugado,
    // Datos de audio (v5)
    uso_audio = false, veces_repitio = 0, velocidad_usada = null,
  } = req.body;

  const act = await Actividad.findByPk(actividad_id);
  if (!act) return res.status(404).json({ error: 'Actividad no encontrada' });

  // Incrementar contador
  await act.increment('veces_jugada');

  // Guardar progreso con datos de audio
  const progreso = await Progreso.create({
    nino_id:       nino_id || req.usuarioId,
    actividad_id,
    completada:    puntuacion >= 60,
    puntuacion:    Math.min(100, Math.max(0, puntuacion)),
    tiempo_seg:    tiempo_seg || 0,
    respuestas:    respuestas || [],
    nivel_jugado:  nivel_jugado || 'basico',
    // Audio (v5)
    uso_audio,
    veces_repitio,
    velocidad_usada,
  });

  // Actualizar niveles del niño
  const nino = await Nino.findOne({ where: { usuario_id: nino_id || req.usuarioId } });
  if (nino && progreso.completada) {
    const campoArea = {
      percepcion:  'nivel_percepcion',
      cognitiva:   'nivel_cognitivo',
      lenguaje:    'nivel_lenguaje',
      lectomatem:  'nivel_lectomatem',
      social:      'nivel_social',
      vida_diaria: 'nivel_vida_diaria',
    };
    const campoSubcarpeta = {
      'Lectura':     'nivel_lectura',
      'Escritura':   'nivel_escritura',
      'Matemáticas': 'nivel_matematicas',
    };

    if (act.area_id) {
      const area = await Area.findByPk(act.area_id);
      const incremento = nivel_jugado === 'basico' ? 2 : nivel_jugado === 'intermedio' ? 3 : 5;

      const campo = campoArea[area?.slug];
      if (campo) {
        await nino.update({ [campo]: Math.min(100, (nino[campo] || 0) + incremento) });
      }

      if (area?.slug === 'lectomatem' && act.subcarpeta) {
        const campoSub = campoSubcarpeta[act.subcarpeta];
        if (campoSub) {
          await nino.update({ [campoSub]: Math.min(100, (nino[campoSub] || 0) + incremento) });
        }
      }
    }

    // Sumar puntos
    const puntosGanados = Math.round((puntuacion / 100) * (act.puntos_max || 100));
    await nino.increment('puntos_totales', { by: puntosGanados });
    await verificarLogros(nino_id || req.usuarioId, nino);
  }

  res.status(201).json({
    mensaje:    progreso.completada ? '¡Actividad completada! 🎉' : 'Progreso guardado',
    progreso,
    completada: progreso.completada,
  });
};

// ── Historial de progreso de un niño ─────────────
const historialProgreso = async (req, res) => {
  const { nino_id } = req.params;
  const { area_id, desde, hasta, page = 1, limit = 20 } = req.query;

  const where = { nino_id, completada: true };
  if (desde || hasta) {
    where.fecha = {};
    if (desde) where.fecha[Op.gte] = new Date(desde);
    if (hasta) where.fecha[Op.lte] = new Date(hasta);
  }

  const { rows, count } = await Progreso.findAndCountAll({
    where,
    include: [{
      model: Actividad, as: 'actividad',
      where: area_id ? { area_id } : {},
      include: [{ model: Area, as: 'area', attributes: ['nombre','slug','icono','color'] }],
    }],
    order: [['fecha','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    progresos: rows,
    total: count,
    pagina: parseInt(page),
    total_paginas: Math.ceil(count / parseInt(limit)),
  });
};

// ── Helper: verificar y otorgar logros ───────────
async function verificarLogros(usuarioId, nino) {
  const totalActs = await Progreso.count({ where: { nino_id: usuarioId, completada: true } });
  const logros    = await Logro.findAll({ where: { activo: true } });

  for (const logro of logros) {
    const yaObtiene = await LogroUsuario.findOne({ where: { usuario_id: usuarioId, logro_id: logro.id } });
    if (yaObtiene) continue;

    let cumple = false;
    if (logro.condicion_tipo === 'actividades' && totalActs >= logro.condicion_valor) cumple = true;
    if (logro.condicion_tipo === 'racha' && (nino?.racha_dias || 0) >= logro.condicion_valor) cumple = true;

    if (cumple) {
      await LogroUsuario.create({ usuario_id: usuarioId, logro_id: logro.id });
      await Notificacion.create({
        usuario_id: usuarioId,
        tipo:    'logro',
        titulo:  `¡Nuevo logro: ${logro.nombre}! ${logro.emoji}`,
        mensaje: logro.descripcion,
        emoji:   logro.emoji,
        color_fondo: '#FFF6E8',
      });
      emitirNotificacion(usuarioId, { tipo: 'logro', logro });
    }
  }
}

// exports moved to bottom

// ── Listar actividades de un área agrupadas ───────
// Devuelve estructura { basico:{Lectura:[],Escritura:[],Matemáticas:[]}, intermedio:{...}, avanzado:{...} }
// Para áreas sin subcarpeta devuelve { basico:[], intermedio:[], avanzado:[] }
const listarPorArea = async (req, res) => {
  const { slug } = req.params;

  const area = await Area.findOne({ where: { slug, activa: true } });
  if (!area) return res.status(404).json({ error: 'Área no encontrada' });

  const acts = await Actividad.findAll({
    where: { area_id: area.id, activa: true },
    order: [['nivel','ASC'], ['subcarpeta','ASC'], ['destacada','DESC'], ['createdAt','ASC']],
  });

  // Agrupar por nivel y luego por subcarpeta (si existe)
  const niveles = ['basico','intermedio','avanzado'];
  const resultado = {};

  for (const nivel of niveles) {
    const delNivel = acts.filter(a => a.nivel === nivel);

    // ¿Tiene subcarpetas este nivel?
    const tieneSubcarpetas = delNivel.some(a => a.subcarpeta);

    if (tieneSubcarpetas) {
      resultado[nivel] = {};
      for (const act of delNivel) {
        const sub = act.subcarpeta || 'General';
        if (!resultado[nivel][sub]) resultado[nivel][sub] = [];
        resultado[nivel][sub].push(act);
      }
    } else {
      resultado[nivel] = delNivel;
    }
  }

  res.json({
    area,
    actividades: resultado,
    tiene_subcarpetas: slug === 'lectomatem',
    total: acts.length,
  });
};

module.exports = { listar, obtener, crear, actualizar, eliminar,
                   completar, historialProgreso, listarPorArea };
