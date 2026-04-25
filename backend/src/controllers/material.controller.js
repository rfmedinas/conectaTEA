/**
 * Material Controller — ConectaTEA
 * Subir · Listar · Descargar · Eliminar material educativo
 */
const path = require('path');
const fs   = require('fs');
const { Material, Usuario, Notificacion } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

// ── Listar material ───────────────────────────────
const listar = async (req, res) => {
  const { tipo, area, nivel, page = 1, limit = 20, q } = req.query;
  const where = { activo: true, aprobado: true };

  if (tipo)  where.tipo  = tipo;
  if (area)  where.area  = area;
  if (nivel) where.nivel = nivel;
  if (q) {
    where[Op.or] = [
      { titulo:      { [Op.like]: `%${q}%` } },
      { descripcion: { [Op.like]: `%${q}%` } },
    ];
  }

  const { rows, count } = await Material.findAndCountAll({
    where,
    include: [{
      model: Usuario, as: 'autor',
      attributes: ['id','nombre','apellido','rol','avatar'],
    }],
    order: [['createdAt','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    materiales: rows,
    total: count,
    pagina: parseInt(page),
    total_paginas: Math.ceil(count / parseInt(limit)),
  });
};

// ── Subir material (profesionales) ───────────────
const subir = async (req, res) => {
  const { titulo, descripcion, tipo, area, nivel, acceso, tags } = req.body;

  if (!titulo) return res.status(400).json({ error: 'Título requerido' });

  let archivo_url    = null;
  let archivo_nombre = null;
  let archivo_size   = 0;
  let formato        = 'PDF';

  if (req.file) {
    archivo_url    = `/uploads/material/${req.file.filename}`;
    archivo_nombre = req.file.originalname;
    archivo_size   = req.file.size;
    formato        = path.extname(req.file.originalname).replace('.','').toUpperCase();
  }

  const mat = await Material.create({
    autor_id:  req.usuarioId,
    titulo,
    descripcion: descripcion || '',
    tipo:    tipo    || 'fichas',
    area:    area    || 'todas',
    nivel:   nivel   || 'todas',
    acceso:  acceso  || 'todos',
    tags:    tags    ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    archivo_url,
    archivo_nombre,
    archivo_size,
    formato,
    emoji:      tipoEmoji(tipo),
    color_fondo: tipoColor(tipo),
    aprobado: true,
  });

  logger.info(`Material subido: "${titulo}" por ${req.usuarioId}`);
  res.status(201).json({ mensaje: 'Material publicado', material: mat });
};

// ── Descargar archivo ─────────────────────────────
const descargar = async (req, res) => {
  const mat = await Material.findByPk(req.params.id);
  if (!mat)            return res.status(404).json({ error: 'Material no encontrado' });
  if (!mat.archivo_url) return res.status(404).json({ error: 'Sin archivo adjunto' });

  // Verificar acceso
  if (mat.acceso === 'profesionales' &&
      !['terapeuta','docente','admin'].includes(req.rol)) {
    return res.status(403).json({ error: 'Solo profesionales pueden descargar este material' });
  }

  await mat.increment('descargas');

  const filePath = path.join(__dirname, '../..', mat.archivo_url);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
  }

  res.download(filePath, mat.archivo_nombre || `material_${mat.id}`);
};

// ── Actualizar ────────────────────────────────────
const actualizar = async (req, res) => {
  const mat = await Material.findByPk(req.params.id);
  if (!mat) return res.status(404).json({ error: 'No encontrado' });
  if (mat.autor_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  await mat.update(req.body);
  res.json({ mensaje: 'Material actualizado', material: mat });
};

// ── Eliminar ──────────────────────────────────────
const eliminar = async (req, res) => {
  const mat = await Material.findByPk(req.params.id);
  if (!mat) return res.status(404).json({ error: 'No encontrado' });
  if (mat.autor_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  // Borrar archivo físico
  if (mat.archivo_url) {
    const fp = path.join(__dirname, '../..', mat.archivo_url);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  await mat.destroy();
  res.json({ mensaje: 'Material eliminado' });
};

// ── Helpers ───────────────────────────────────────
function tipoEmoji(tipo) {
  const map = { fichas:'📄', guias:'📚', videos:'🎥', pictogramas:'🖼️', evaluaciones:'📝', otros:'📂' };
  return map[tipo] || '📂';
}
function tipoColor(tipo) {
  const map = { fichas:'#EBF1FF', guias:'#E3F9F1', videos:'#F0EBFF', pictogramas:'#FFF6E8', evaluaciones:'#FFF0EC', otros:'#EBF1FF' };
  return map[tipo] || '#EBF1FF';
}

module.exports = { listar, subir, descargar, actualizar, eliminar };
