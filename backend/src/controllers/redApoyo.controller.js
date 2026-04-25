/**
 * Red de Apoyo Controller — ConectaTEA
 * CRUD directorio de profesionales e instituciones TEA
 */
const { RedApoyo } = require('../models');
const { Op } = require('sequelize');

// ── Listar (público con filtros) ──────────────────
const listar = async (req, res) => {
  const { tipo, ciudad, virtual, page = 1, limit = 15, q } = req.query;
  const where = { activo: true };

  if (tipo)    where.tipo    = tipo;
  if (ciudad)  where.ciudad  = { [Op.like]: `%${ciudad}%` };
  if (virtual === 'true') where.atiende_virtual = true;
  if (q) {
    where[Op.or] = [
      { nombre:      { [Op.like]: `%${q}%` } },
      { descripcion: { [Op.like]: `%${q}%` } },
      { ciudad:      { [Op.like]: `%${q}%` } },
    ];
  }

  const { rows, count } = await RedApoyo.findAndCountAll({
    where,
    order: [['verified','DESC'], ['calificacion','DESC'], ['nombre','ASC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    red: rows,
    total: count,
    pagina: parseInt(page),
    total_paginas: Math.ceil(count / parseInt(limit)),
  });
};

// ── Obtener uno ───────────────────────────────────
const obtener = async (req, res) => {
  const r = await RedApoyo.findByPk(req.params.id);
  if (!r || !r.activo) return res.status(404).json({ error: 'No encontrado' });
  res.json({ recurso: r });
};

// ── Crear (admin o profesionales registrados) ─────
const crear = async (req, res) => {
  const {
    nombre, tipo, descripcion, especialidades, ciudad, departamento,
    direccion, telefono, email, sitio_web,
    atiende_virtual, atiende_presencial, cubre_eps,
  } = req.body;

  if (!nombre || !tipo) {
    return res.status(400).json({ error: 'Nombre y tipo requeridos' });
  }

  const r = await RedApoyo.create({
    nombre, tipo, descripcion,
    especialidades: especialidades || [],
    ciudad, departamento, direccion, telefono, email, sitio_web,
    atiende_virtual:    atiende_virtual    || false,
    atiende_presencial: atiende_presencial !== false,
    cubre_eps:          cubre_eps          || false,
    emoji:      tipoEmoji(tipo),
    color_tipo: tipoColor(tipo),
    color_fondo: tipoFondo(tipo),
    verified: req.rol === 'admin',
    activo: true,
  });

  res.status(201).json({ mensaje: 'Recurso agregado a la red de apoyo', recurso: r });
};

// ── Actualizar ────────────────────────────────────
const actualizar = async (req, res) => {
  const r = await RedApoyo.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'No encontrado' });
  await r.update(req.body);
  res.json({ mensaje: 'Actualizado', recurso: r });
};

// ── Eliminar ──────────────────────────────────────
const eliminar = async (req, res) => {
  const r = await RedApoyo.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'No encontrado' });
  await r.destroy();
  res.json({ mensaje: 'Eliminado' });
};

// ── Verificar (admin) ─────────────────────────────
const verificar = async (req, res) => {
  const r = await RedApoyo.findByPk(req.params.id);
  if (!r) return res.status(404).json({ error: 'No encontrado' });
  await r.update({ verified: true });
  res.json({ mensaje: 'Recurso verificado ✅', recurso: r });
};

// ── Helpers ───────────────────────────────────────
function tipoEmoji(t) {
  const m = { terapeuta:'🧑‍⚕️', psicologo:'🧠', colegio:'🏫', institucion:'🏛️', fundacion:'❤️', medico:'👨‍⚕️', otro:'🌐' };
  return m[t] || '🌐';
}
function tipoColor(t) {
  const m = { terapeuta:'#FFB347', psicologo:'#8B5CF6', colegio:'#2ECC8E', institucion:'#4C7EF3', fundacion:'#FF6B6B', medico:'#14B8A6', otro:'#94A3B8' };
  return m[t] || '#4C7EF3';
}
function tipoFondo(t) {
  const m = { terapeuta:'#FFF6E8', psicologo:'#F0EBFF', colegio:'#E3F9F1', institucion:'#EBF1FF', fundacion:'#FFF0F0', medico:'#E0F7F5', otro:'#F0F4FF' };
  return m[t] || '#EBF1FF';
}

module.exports = { listar, obtener, crear, actualizar, eliminar, verificar };
