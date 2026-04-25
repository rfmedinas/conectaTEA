/**
 * Rutina Controller — ConectaTEA
 * CRUD rutinas + pasos + estado de completado
 */
const { Rutina, PasoRutina, Usuario, Relacion } = require('../models');
const { Op } = require('sequelize');

// ── Listar rutinas del niño ───────────────────────
const listar = async (req, res) => {
  const { nino_id } = req.query;
  const where = { activa: true };

  if (nino_id) {
    where[Op.or] = [{ nino_id }, { nino_id: null, es_publica: true }];
  } else {
    where.es_publica = true;
  }

  const rutinas = await Rutina.findAll({
    where,
    include: [{ model: PasoRutina, as: 'pasos', order: [['orden','ASC']] }],
    order: [['nombre','ASC']],
  });

  res.json({ rutinas });
};

// ── Obtener una rutina ────────────────────────────
const obtener = async (req, res) => {
  const r = await Rutina.findByPk(req.params.id, {
    include: [{ model: PasoRutina, as: 'pasos', order: [['orden','ASC']] }],
  });
  if (!r) return res.status(404).json({ error: 'Rutina no encontrada' });
  res.json({ rutina: r });
};

// ── Crear rutina ──────────────────────────────────
const crear = async (req, res) => {
  const { nombre, emoji, color, hora_inicio, dias, es_publica, nino_id, pasos } = req.body;

  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

  const rutina = await Rutina.create({
    nombre,
    emoji:       emoji       || '📅',
    color:       color       || '#4C7EF3',
    hora_inicio: hora_inicio || null,
    dias:        dias        || ['lunes','martes','miercoles','jueves','viernes'],
    es_publica:  es_publica  || false,
    nino_id:     nino_id     || null,
    creado_por:  req.usuarioId,
  });

  // Crear pasos si vienen en el body
  if (Array.isArray(pasos) && pasos.length) {
    const pasosData = pasos.map((p, i) => ({
      rutina_id:    rutina.id,
      orden:        i,
      nombre:       p.nombre || p.n,
      icono:        p.icono  || p.ico || '✅',
      duracion_seg: p.duracion_seg || 0,
      obligatorio:  p.obligatorio !== false,
    }));
    await PasoRutina.bulkCreate(pasosData);
  }

  const rutinaCompleta = await Rutina.findByPk(rutina.id, {
    include: [{ model: PasoRutina, as: 'pasos', order: [['orden','ASC']] }],
  });

  res.status(201).json({ mensaje: 'Rutina creada', rutina: rutinaCompleta });
};

// ── Actualizar rutina ─────────────────────────────
const actualizar = async (req, res) => {
  const r = await Rutina.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'No encontrada' });

  const { pasos, ...datos } = req.body;
  await r.update(datos);

  // Si vienen pasos nuevos, reemplazar
  if (Array.isArray(pasos)) {
    await PasoRutina.destroy({ where: { rutina_id: r.id } });
    if (pasos.length) {
      await PasoRutina.bulkCreate(pasos.map((p, i) => ({
        rutina_id: r.id,
        orden: i,
        nombre: p.nombre || p.n,
        icono:  p.icono  || p.ico || '✅',
        duracion_seg: p.duracion_seg || 0,
        obligatorio:  p.obligatorio !== false,
      })));
    }
  }

  const actualizada = await Rutina.findByPk(r.id, {
    include: [{ model: PasoRutina, as: 'pasos', order: [['orden','ASC']] }],
  });
  res.json({ mensaje: 'Rutina actualizada', rutina: actualizada });
};

// ── Eliminar rutina ───────────────────────────────
const eliminar = async (req, res) => {
  const r = await Rutina.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'No encontrada' });
  await PasoRutina.destroy({ where: { rutina_id: r.id } });
  await r.destroy();
  res.json({ mensaje: 'Rutina eliminada' });
};

// ── Agregar paso ──────────────────────────────────
const agregarPaso = async (req, res) => {
  const { nombre, icono, duracion_seg, obligatorio } = req.body;
  const r = await Rutina.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'Rutina no encontrada' });

  const ultimoOrden = await PasoRutina.max('orden', { where: { rutina_id: r.id } }) || 0;

  const paso = await PasoRutina.create({
    rutina_id:    r.id,
    orden:        (ultimoOrden || 0) + 1,
    nombre:       nombre || 'Nuevo paso',
    icono:        icono  || '✅',
    duracion_seg: duracion_seg || 0,
    obligatorio:  obligatorio !== false,
  });

  res.status(201).json({ mensaje: 'Paso agregado', paso });
};

// ── Eliminar paso ─────────────────────────────────
const eliminarPaso = async (req, res) => {
  const paso = await PasoRutina.findByPk(req.params.paso_id);
  if (!paso) return res.status(404).json({ error: 'Paso no encontrado' });
  await paso.destroy();
  res.json({ mensaje: 'Paso eliminado' });
};

module.exports = { listar, obtener, crear, actualizar, eliminar, agregarPaso, eliminarPaso };
