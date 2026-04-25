/**
 * video.controller.js — ConectaTEA v6
 * CRUD de videos YouTube + registro de vistas + recomendaciones
 */
const { Op } = require('sequelize');
const { Video, VideoVisto, Nino } = require('../models');
const logger = require('../config/logger');

// ── GET /videos ────────────────────────────────────────────
exports.listar = async (req, res) => {
  const { categoria, edad, destacado, page = 1, limit = 30 } = req.query;
  const where = { activo: true, revisado: true, apto_tea: true };

  if (categoria && categoria !== 'todos') where.categoria = categoria;
  if (destacado) where.destacado = true;
  if (edad) {
    where.edad_min = { [Op.lte]: parseInt(edad) };
    where.edad_max = { [Op.gte]: parseInt(edad) };
  }

  const { rows, count } = await Video.findAndCountAll({
    where,
    order: [['destacado','DESC'],['nuevo','DESC'],['veces_visto','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({ videos: rows, total: count, pagina: parseInt(page) });
};

// ── GET /videos/:id ────────────────────────────────────────
exports.obtener = async (req, res) => {
  const v = await Video.findByPk(req.params.id);
  if (!v || !v.activo) return res.status(404).json({ error: 'Video no encontrado' });
  // Incrementar contador de vistas
  await v.increment('veces_visto');
  res.json({ video: v });
};

// ── GET /videos/categorias ────────────────────────────────
exports.categorias = async (_req, res) => {
  const cats = await Video.findAll({
    where: { activo: true },
    attributes: ['categoria'],
    group: ['categoria'],
  });
  const conteos = await Video.findAll({
    where: { activo: true },
    attributes: ['categoria', [require('sequelize').fn('COUNT','*'), 'total']],
    group: ['categoria'],
    raw: true,
  });
  res.json({
    categorias: [
      { id:'todos',      nombre:'Todos',       icono:'📺' },
      { id:'canciones',  nombre:'Canciones',   icono:'🎵' },
      { id:'cuentos',    nombre:'Cuentos',     icono:'📖' },
      { id:'emociones',  nombre:'Emociones',   icono:'😊' },
      { id:'naturaleza', nombre:'Naturaleza',  icono:'🌿' },
      { id:'aprendizaje',nombre:'Aprender',    icono:'🎓' },
      { id:'relajacion', nombre:'Calma',       icono:'🌊' },
    ],
    conteos,
  });
};

// ── POST /videos ──────────────────────────────────────────
exports.crear = async (req, res) => {
  const {
    youtube_id, titulo, subtitulo, descripcion, categoria,
    duracion, duracion_seg, edad_min, edad_max,
    color_fondo, nuevo, destacado, apto_tea,
  } = req.body;

  if (!youtube_id || !titulo)
    return res.status(400).json({ error: 'youtube_id y titulo son obligatorios' });

  // Verificar que no exista ya ese video de YouTube
  const existe = await Video.findOne({ where: { youtube_id } });
  if (existe) return res.status(409).json({ error: 'Este video ya está en la plataforma', video: existe });

  const v = await Video.create({
    youtube_id: youtube_id.trim(),
    titulo, subtitulo, descripcion,
    categoria: categoria || 'aprendizaje',
    duracion, duracion_seg,
    edad_min: edad_min || 3,
    edad_max: edad_max || 12,
    color_fondo: color_fondo || '#EBF1FF',
    nuevo: nuevo !== false,
    destacado: !!destacado,
    apto_tea:  apto_tea !== false,
    creado_por: req.usuarioId,
  });

  logger.info(`📺 Video añadido: "${titulo}" (${youtube_id}) por ${req.usuarioId}`);
  res.status(201).json({ mensaje: 'Video añadido correctamente', video: v });
};

// ── PUT /videos/:id ───────────────────────────────────────
exports.actualizar = async (req, res) => {
  const v = await Video.findByPk(req.params.id);
  if (!v) return res.status(404).json({ error: 'No encontrado' });
  await v.update(req.body);
  res.json({ mensaje: 'Video actualizado', video: v });
};

// ── DELETE /videos/:id ────────────────────────────────────
exports.eliminar = async (req, res) => {
  const v = await Video.findByPk(req.params.id);
  if (!v) return res.status(404).json({ error: 'No encontrado' });
  await v.destroy();
  res.json({ mensaje: 'Video eliminado' });
};

// ── POST /videos/:id/visto ────────────────────────────────
// El niño registra que vio un video (puede enviarse al cerrar)
exports.registrarVisto = async (req, res) => {
  const { nino_id, duracion_seg = 0, completado = false, reaccion } = req.body;
  const video = await Video.findByPk(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video no encontrado' });

  const visto = await VideoVisto.create({
    nino_id:      nino_id || req.usuarioId,
    video_id:     video.id,
    duracion_seg,
    completado,
    reaccion: reaccion || null,
  });
  await video.increment('veces_visto');
  res.status(201).json({ mensaje: 'Vista registrada', visto });
};

// ── GET /videos/historial/:nino_id ────────────────────────
exports.historial = async (req, res) => {
  const vistas = await VideoVisto.findAll({
    where: { nino_id: req.params.nino_id },
    include: [{ model: Video, as: 'video', attributes: ['youtube_id','titulo','categoria','duracion'] }],
    order: [['fecha','DESC']],
    limit: 30,
  });
  res.json({ historial: vistas, total: vistas.length });
};

// ── GET /videos/recomendados/:nino_id ─────────────────────
// Recomienda videos según historial y preferencias del niño
exports.recomendados = async (req, res) => {
  const { nino_id } = req.params;

  // Categorías ya vistas
  const vistas = await VideoVisto.findAll({
    where: { nino_id },
    include: [{ model: Video, as: 'video', attributes: ['categoria'] }],
  });
  const catsVistas = [...new Set(vistas.map(v => v.video?.categoria).filter(Boolean))];

  // Videos que le gustaron
  const gustados = await VideoVisto.findAll({
    where: { nino_id, reaccion: 'me_gusto' },
    attributes: ['video_id'],
  });
  const idsGustados = gustados.map(v => v.video_id);

  // Recomendar: misma categoría que gustados + no vistos aún
  const idsVistos = vistas.map(v => v.video_id);
  const where = {
    activo: true, apto_tea: true,
    id: { [Op.notIn]: idsVistos.length ? idsVistos : ['00000000-0000-0000-0000-000000000000'] },
  };
  if (catsVistas.length) where.categoria = { [Op.in]: catsVistas };

  const recomendados = await Video.findAll({
    where,
    order: [['destacado','DESC'],['veces_visto','DESC']],
    limit: 8,
  });

  // Si no hay suficientes, completar con cualquier video no visto
  if (recomendados.length < 4) {
    const extra = await Video.findAll({
      where: {
        activo: true, apto_tea: true,
        id: { [Op.notIn]: [...idsVistos, ...recomendados.map(r=>r.id)] },
      },
      order: [['destacado','DESC']],
      limit: 4 - recomendados.length,
    });
    recomendados.push(...extra);
  }

  res.json({ recomendados, basado_en: catsVistas });
};
