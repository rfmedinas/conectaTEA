/**
 * Chat Controller — ConectaTEA
 * Mensajes del canal de padres (REST + Socket.io)
 */
const { ChatMensaje, Usuario } = require('../models');
const { Op } = require('sequelize');

// ── Obtener mensajes de un canal ──────────────────
const listarMensajes = async (req, res) => {
  const { canal = 'general', page = 1, limit = 30 } = req.query;

  if (!['general','experiencias','preguntas'].includes(canal)) {
    return res.status(400).json({ error: 'Canal inválido' });
  }

  const { rows, count } = await ChatMensaje.findAndCountAll({
    where: { canal, eliminado: false },
    include: [{
      model: Usuario, as: 'usuario',
      attributes: ['id','nombre','avatar','rol'],
      required: false,
    }],
    order:  [['createdAt','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    mensajes: rows.reverse(), // más viejos primero en UI
    total: count,
    pagina: parseInt(page),
    total_paginas: Math.ceil(count / parseInt(limit)),
  });
};

// ── Enviar mensaje (REST fallback si no hay socket) ─
const enviarMensaje = async (req, res) => {
  const { texto, canal = 'general', tipo = 'texto', es_experiencia } = req.body;

  if (!texto?.trim()) return res.status(400).json({ error: 'Texto requerido' });
  if (!['general','experiencias','preguntas'].includes(canal)) {
    return res.status(400).json({ error: 'Canal inválido' });
  }

  const msg = await ChatMensaje.create({
    usuario_id:     req.usuarioId,
    canal,
    texto:          texto.trim().substring(0, 1000),
    tipo,
    es_experiencia: es_experiencia || canal === 'experiencias',
    autor_nombre:   `${req.usuario.nombre} ${req.usuario.apellido}`,
    autor_avatar:   req.usuario.avatar || '😊',
    autor_rol:      req.usuario.rol,
  });

  res.status(201).json({ mensaje: 'Mensaje enviado', chat: msg });
};

// ── Editar propio mensaje ─────────────────────────
const editarMensaje = async (req, res) => {
  const msg = await ChatMensaje.findByPk(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Mensaje no encontrado' });
  if (msg.usuario_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  await msg.update({ texto: req.body.texto?.trim(), editado: true });
  res.json({ mensaje: 'Editado', chat: msg });
};

// ── Eliminar mensaje (soft) ───────────────────────
const eliminarMensaje = async (req, res) => {
  const msg = await ChatMensaje.findByPk(req.params.id);
  if (!msg) return res.status(404).json({ error: 'No encontrado' });
  if (msg.usuario_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  await msg.update({ eliminado: true, texto: '[Mensaje eliminado]' });
  res.json({ mensaje: 'Eliminado' });
};

// ── Experiencias destacadas ───────────────────────
const experiencias = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { rows, count } = await ChatMensaje.findAndCountAll({
    where: { canal: 'experiencias', es_experiencia: true, eliminado: false },
    include: [{
      model: Usuario, as: 'usuario',
      attributes: ['id','nombre','avatar','rol'],
      required: false,
    }],
    order: [['createdAt','DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });
  res.json({ experiencias: rows, total: count });
};

module.exports = { listarMensajes, enviarMensaje, editarMensaje, eliminarMensaje, experiencias };
