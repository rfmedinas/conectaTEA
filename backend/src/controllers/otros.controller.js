// ══ NOTIFICACION CONTROLLER ══════════════════════
const { Notificacion } = require('../models');

const listarNotificaciones = async (req, res) => {
  const { page = 1, limit = 20, solo_no_leidas } = req.query;
  const where = { usuario_id: req.usuarioId };
  if (solo_no_leidas === 'true') where.leida = false;

  const { rows, count } = await Notificacion.findAndCountAll({
    where,
    order: [['createdAt','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  const no_leidas = await Notificacion.count({ where: { usuario_id: req.usuarioId, leida: false } });

  res.json({ notificaciones: rows, total: count, no_leidas });
};

const marcarLeida = async (req, res) => {
  const n = await Notificacion.findOne({ where: { id: req.params.id, usuario_id: req.usuarioId } });
  if (!n) return res.status(404).json({ error: 'No encontrada' });
  await n.update({ leida: true });
  res.json({ mensaje: 'Marcada como leída' });
};

const marcarTodasLeidas = async (req, res) => {
  await Notificacion.update({ leida: true }, { where: { usuario_id: req.usuarioId, leida: false } });
  res.json({ mensaje: 'Todas marcadas como leídas' });
};

const eliminarNotificacion = async (req, res) => {
  await Notificacion.destroy({ where: { id: req.params.id, usuario_id: req.usuarioId } });
  res.json({ mensaje: 'Eliminada' });
};

module.exports.notificacion = { listarNotificaciones, marcarLeida, marcarTodasLeidas, eliminarNotificacion };


// ══ LOGRO CONTROLLER ════════════════════════════
const { Logro, LogroUsuario, Usuario } = require('../models');

const listarLogros = async (req, res) => {
  const logros = await Logro.findAll({ where: { activo: true }, order: [['orden','ASC']] });
  res.json({ logros });
};

const misLogros = async (req, res) => {
  const uid = req.params.nino_id || req.usuarioId;
  const obtenidos = await LogroUsuario.findAll({
    where: { usuario_id: uid },
    include: [{ model: Logro, as: 'logro' }],
    order: [['fecha_obtenido','DESC']],
  });
  const todosIds = obtenidos.map(l => l.logro_id);
  const pendientes = await Logro.findAll({
    where: { activo: true, id: { [require('sequelize').Op.notIn]: todosIds.length ? todosIds : ['none'] } },
  });
  res.json({ obtenidos, pendientes });
};

const crearLogro = async (req, res) => {
  const l = await Logro.create(req.body);
  res.status(201).json({ logro: l });
};

module.exports.logro = { listarLogros, misLogros, crearLogro };


// ══ PICTOGRAMA CONTROLLER ════════════════════════
const { Pictograma } = require('../models');
const { Op: OpPic } = require('sequelize');

const listarPictogramas = async (req, res) => {
  const { categoria, q, page = 1, limit = 50 } = req.query;
  const where = { activo: true };
  if (categoria) where.categoria = categoria;
  if (q) where.palabra = { [OpPic.like]: `%${q}%` };

  const { rows, count } = await Pictograma.findAndCountAll({
    where,
    order: [['orden','ASC'], ['palabra','ASC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });
  res.json({ pictogramas: rows, total: count });
};

const crearPictograma = async (req, res) => {
  const p = await Pictograma.create(req.body);
  res.status(201).json({ pictograma: p });
};

const actualizarPictograma = async (req, res) => {
  const p = await Pictograma.findByPk(req.params.id);
  if (!p) return res.status(404).json({ error: 'No encontrado' });
  await p.update(req.body);
  res.json({ pictograma: p });
};

module.exports.pictograma = { listarPictogramas, crearPictograma, actualizarPictograma };


// ══ PROGRESO CONTROLLER ═════════════════════════
const { Progreso, Actividad, Area } = require('../models');

const resumenProgreso = async (req, res) => {
  const { nino_id } = req.params;
  const total       = await Progreso.count({ where: { nino_id, completada: true } });
  const porNivel    = await Progreso.findAll({
    where: { nino_id, completada: true },
    attributes: ['nivel_jugado', [require('sequelize').fn('COUNT','*'), 'cantidad']],
    group: ['nivel_jugado'],
    raw: true,
  });
  res.json({ total, por_nivel: porNivel });
};

module.exports.progreso = { resumenProgreso };


// ══ AREA CONTROLLER ════════════════════════════
const { Area: AreaModel } = require('../models');

const listarAreas = async (req, res) => {
  const areas = await AreaModel.findAll({ where: { activa: true }, order: [['orden','ASC']] });
  res.json({ areas });
};

const obtenerArea = async (req, res) => {
  const a = await AreaModel.findOne({
    where: { [require('sequelize').Op.or]: [{ id: req.params.id }, { slug: req.params.id }] },
  });
  if (!a) return res.status(404).json({ error: 'Área no encontrada' });
  res.json({ area: a });
};

const crearArea = async (req, res) => {
  const a = await AreaModel.create(req.body);
  res.status(201).json({ area: a });
};

module.exports.area = { listarAreas, obtenerArea, crearArea };
