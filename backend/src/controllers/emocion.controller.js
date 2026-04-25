/**
 * Emocion Controller — ConectaTEA
 * Catálogo · Registro diario · Historial
 */
const { Emocion, RegistroEmocion, Usuario, Notificacion } = require('../models');
const { Op } = require('sequelize');

// ── Listar emociones (público) ────────────────────
const listar = async (req, res) => {
  const { categoria } = req.query;
  const where = { activa: true };
  if (categoria) where.categoria = categoria;

  const emociones = await Emocion.findAll({
    where,
    order: [['orden','ASC'], ['nombre','ASC']],
  });
  res.json({ emociones });
};

// ── Registrar emoción (niño) ──────────────────────
const registrar = async (req, res) => {
  const { emocion_id, intensidad, contexto, nota, nino_id } = req.body;

  const emocion = await Emocion.findByPk(emocion_id);
  if (!emocion) return res.status(404).json({ error: 'Emoción no encontrada' });

  const uid = nino_id || req.usuarioId;

  const registro = await RegistroEmocion.create({
    nino_id:    uid,
    emocion_id,
    intensidad: intensidad || 3,
    contexto:   contexto   || 'casa',
    nota:       nota?.trim() || null,
    fecha:      new Date(),
  });

  // Si intensidad muy alta (>=4) notificar al familiar/terapeuta
  if (intensidad >= 4) {
    const { Relacion } = require('../models');
    const { emitirNotificacion } = require('../config/socket');
    const adultos = await Relacion.findAll({ where: { nino_id: uid, activo: true } });
    for (const rel of adultos) {
      await Notificacion.create({
        usuario_id: rel.adulto_id,
        tipo: 'sistema',
        titulo: `Emoción intensa registrada`,
        mensaje: `Intensidad ${intensidad}/5 de "${emocion.nombre}" en contexto: ${contexto}`,
        emoji: emocion.emoji,
        color_fondo: emocion.color_fondo,
      });
      emitirNotificacion(rel.adulto_id, { tipo: 'emocion_intensa', emocion: emocion.nombre, intensidad });
    }
  }

  res.status(201).json({ mensaje: 'Emoción registrada', registro });
};

// ── Historial emocional del niño ──────────────────
const historial = async (req, res) => {
  const { nino_id } = req.params;
  const { desde, hasta, page = 1, limit = 20 } = req.query;

  const where = { nino_id };
  if (desde || hasta) {
    where.fecha = {};
    if (desde) where.fecha[Op.gte] = new Date(desde);
    if (hasta) where.fecha[Op.lte] = new Date(hasta);
  }

  const { rows, count } = await RegistroEmocion.findAndCountAll({
    where,
    include: [{ model: Emocion, as: 'emocion' }],
    order: [['fecha','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  // Estadísticas básicas
  const stats = {};
  rows.forEach(r => {
    const n = r.emocion?.nombre;
    if (n) stats[n] = (stats[n] || 0) + 1;
  });

  res.json({
    registros: rows,
    total: count,
    estadisticas: stats,
    pagina: parseInt(page),
    total_paginas: Math.ceil(count / parseInt(limit)),
  });
};

// ── CRUD emociones (admin) ────────────────────────
const crear = async (req, res) => {
  const e = await Emocion.create(req.body);
  res.status(201).json({ emocion: e });
};

const actualizar = async (req, res) => {
  const e = await Emocion.findByPk(req.params.id);
  if (!e) return res.status(404).json({ error: 'No encontrada' });
  await e.update(req.body);
  res.json({ emocion: e });
};

module.exports = { listar, registrar, historial, crear, actualizar };
