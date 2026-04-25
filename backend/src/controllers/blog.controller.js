/**
 * Blog Controller — ConectaTEA
 * CRUD posts · Vista pública · Buscar
 */
const { BlogPost, Usuario } = require('../models');
const { Op } = require('sequelize');

const slugify = (str) =>
  str.toLowerCase()
     .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
     .replace(/[^a-z0-9\s-]/g, '')
     .trim().replace(/\s+/g, '-').substring(0, 200);

// ── Listar posts (público) ────────────────────────
const listar = async (req, res) => {
  const { categoria, destacado, page = 1, limit = 12, q } = req.query;
  const where = { publicado: true };

  if (categoria)  where.categoria = categoria;
  if (destacado)  where.destacado = destacado === 'true';
  if (q) {
    where[Op.or] = [
      { titulo:   { [Op.like]: `%${q}%` } },
      { resumen:  { [Op.like]: `%${q}%` } },
      { contenido:{ [Op.like]: `%${q}%` } },
    ];
  }

  const { rows, count } = await BlogPost.findAndCountAll({
    where,
    attributes: { exclude: ['contenido'] }, // listado sin contenido completo
    include: [{
      model: Usuario, as: 'autor',
      attributes: ['id','nombre','apellido','rol','avatar'],
      required: false,
    }],
    order: [['destacado','DESC'], ['fecha_publicacion','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({
    posts: rows,
    total: count,
    pagina: parseInt(page),
    total_paginas: Math.ceil(count / parseInt(limit)),
  });
};

// ── Obtener post completo por slug o id ───────────
const obtener = async (req, res) => {
  const { idOrSlug } = req.params;
  const where = idOrSlug.includes('-') && idOrSlug.length > 10
    ? { slug: idOrSlug }
    : { id:   idOrSlug };

  const post = await BlogPost.findOne({
    where: { ...where, publicado: true },
    include: [{
      model: Usuario, as: 'autor',
      attributes: ['id','nombre','apellido','rol','avatar'],
      required: false,
    }],
  });
  if (!post) return res.status(404).json({ error: 'Post no encontrado' });

  // Incrementar vistas
  await post.increment('vistas');

  // Posts relacionados
  const relacionados = await BlogPost.findAll({
    where: { publicado: true, categoria: post.categoria, id: { [Op.ne]: post.id } },
    attributes: { exclude: ['contenido'] },
    limit: 3,
    order: [['fecha_publicacion','DESC']],
  });

  res.json({ post, relacionados });
};

// ── Crear post (admin o profesionales con permiso) ─
const crear = async (req, res) => {
  const {
    titulo, resumen, contenido, categoria,
    emoji, imagen_url, color_fondo, color_acento,
    tiempo_lectura, autor_nombre, destacado, tags,
  } = req.body;

  if (!titulo || !contenido) {
    return res.status(400).json({ error: 'Título y contenido requeridos' });
  }

  // Generar slug único
  let slug = slugify(titulo);
  const existe = await BlogPost.findOne({ where: { slug } });
  if (existe) slug = `${slug}-${Date.now()}`;

  const post = await BlogPost.create({
    autor_id:   req.usuarioId,
    titulo, slug, resumen, contenido,
    categoria:  categoria    || 'guias',
    emoji:      emoji        || '📰',
    imagen_url, color_fondo, color_acento,
    tiempo_lectura: tiempo_lectura || calcularLectura(contenido),
    autor_nombre:   autor_nombre || `${req.usuario.nombre} ${req.usuario.apellido}`,
    destacado:  destacado || false,
    publicado:  true,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    fecha_publicacion: new Date(),
  });

  res.status(201).json({ mensaje: 'Post publicado', post });
};

// ── Actualizar post ───────────────────────────────
const actualizar = async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'No encontrado' });
  if (post.autor_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }

  // Regenerar slug si cambió el título
  if (req.body.titulo && req.body.titulo !== post.titulo) {
    req.body.slug = slugify(req.body.titulo);
  }
  await post.update(req.body);
  res.json({ mensaje: 'Post actualizado', post });
};

// ── Eliminar (soft delete) ────────────────────────
const eliminar = async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (!post) return res.status(404).json({ error: 'No encontrado' });
  if (post.autor_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  await post.destroy();
  res.json({ mensaje: 'Post eliminado' });
};

// ── Helper ────────────────────────────────────────
function calcularLectura(texto) {
  const palabras = texto ? texto.split(/\s+/).length : 0;
  const minutos  = Math.ceil(palabras / 200);
  return `${minutos} min`;
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
