/**
 * Nino Controller — ConectaTEA
 * CRUD de perfiles de niños + gestión de relaciones
 */
const { Op } = require('sequelize');
const { Usuario, Nino, Relacion, Progreso, Actividad, RegistroEmocion,
        Emocion, Logro, LogroUsuario, Notificacion } = require('../models');

// ── Crear perfil de niño ──────────────────────────
const crearNino = async (req, res) => {
  const {
    nombre, apellido, nombre_preferido, fecha_nacimiento, edad,
    nivel_tea, tipo_comunicacion, intereses, sensibilidades,
    diagnostico_fecha, observaciones, tipo_relacion,
  } = req.body;

  // Crear usuario para el niño (sin email ni password)
  const usuarioNino = await Usuario.create({
    nombre,
    apellido: apellido || '',
    rol: 'nino',
    avatar: '🧒',
    email: null,
    password_hash: null,
  });

  // Perfil extendido
  const perfil = await Nino.create({
    usuario_id: usuarioNino.id,
    nombre_preferido: nombre_preferido || nombre,
    fecha_nacimiento, edad,
    nivel_tea: nivel_tea || '2_moderado',
    tipo_comunicacion: tipo_comunicacion || 'verbal',
    intereses:    intereses    || [],
    sensibilidades: sensibilidades || [],
    diagnostico_fecha, observaciones,
  });

  // Vincular con el adulto que lo crea
  await Relacion.create({
    adulto_id: req.usuarioId,
    nino_id:   usuarioNino.id,
    tipo:      tipo_relacion || (req.rol === 'padre' ? 'padre' : req.rol),
  });

  // Notificar
  await Notificacion.create({
    usuario_id: req.usuarioId,
    tipo:    'sistema',
    titulo:  `Perfil de ${nombre} creado ✅`,
    mensaje: `El perfil de ${nombre_preferido || nombre} ha sido agregado a tu cuenta.`,
    emoji:   '👦',
    color_fondo: '#EBF1FF',
  });

  res.status(201).json({
    mensaje: 'Perfil creado con éxito',
    nino: { ...usuarioNino.toJSON(), perfil },
  });
};

// ── Obtener mis niños (relaciones del adulto) ─────
const misNinos = async (req, res) => {
  const relaciones = await Relacion.findAll({
    where: { adulto_id: req.usuarioId, activo: true },
    include: [{
      model: Usuario,
      as: 'nino',
      include: [{ model: Nino, as: 'perfil_nino' }],
    }],
  });

  const ninos = relaciones.map(r => ({
    ...r.nino.toJSON(),
    relacion_tipo: r.tipo,
    relacion_id:   r.id,
  }));

  res.json({ ninos });
};

// ── Detalle de un niño ─────────────────────────────
const obtenerNino = async (req, res) => {
  const { id } = req.params;

  // Verificar acceso
  const relacion = await Relacion.findOne({
    where: { adulto_id: req.usuarioId, nino_id: id, activo: true },
  });
  if (!relacion && req.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes acceso a este niño' });
  }

  const usuario = await Usuario.findByPk(id, {
    include: [{ model: Nino, as: 'perfil_nino' }],
  });
  if (!usuario) return res.status(404).json({ error: 'Niño no encontrado' });

  res.json({ nino: usuario.toJSON() });
};

// ── Actualizar perfil ─────────────────────────────
const actualizarNino = async (req, res) => {
  const { id } = req.params;
  const {
    nombre, apellido, nombre_preferido, edad, nivel_tea,
    tipo_comunicacion, intereses, sensibilidades, observaciones,
    diagnostico_fecha, fecha_nacimiento,
  } = req.body;

  const relacion = await Relacion.findOne({
    where: { adulto_id: req.usuarioId, nino_id: id, activo: true },
  });
  if (!relacion && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin acceso' });
  }

  const usuario = await Usuario.findByPk(id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });

  if (nombre)    await usuario.update({ nombre });
  if (apellido)  await usuario.update({ apellido });

  const perfil = await Nino.findOne({ where: { usuario_id: id } });
  if (perfil) {
    await perfil.update({
      ...(nombre_preferido  && { nombre_preferido }),
      ...(edad              && { edad }),
      ...(nivel_tea         && { nivel_tea }),
      ...(tipo_comunicacion && { tipo_comunicacion }),
      ...(intereses         && { intereses }),
      ...(sensibilidades    && { sensibilidades }),
      ...(observaciones     && { observaciones }),
      ...(diagnostico_fecha && { diagnostico_fecha }),
      ...(fecha_nacimiento  && { fecha_nacimiento }),
    });
  }

  res.json({ mensaje: 'Perfil actualizado', nino: usuario.toJSON() });
};

// ── Progreso del niño por área ─────────────────────
const progresoNino = async (req, res) => {
  const { id } = req.params;

  const relacion = await Relacion.findOne({
    where: { adulto_id: req.usuarioId, nino_id: id, activo: true },
  });
  if (!relacion && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin acceso' });
  }

  const perfil = await Nino.findOne({ where: { usuario_id: id } });
  if (!perfil) return res.status(404).json({ error: 'Perfil no encontrado' });

  // Progresos agrupados por área y nivel
  const progresos = await Progreso.findAll({
    where: { nino_id: id, completada: true },
    include: [{ model: Actividad, as: 'actividad', attributes: ['tipo','nivel','titulo'] }],
    order: [['fecha', 'DESC']],
    limit: 50,
  });

  // Últimas emociones registradas
  const emociones = await RegistroEmocion.findAll({
    where: { nino_id: id },
    include: [{ model: Emocion, as: 'emocion' }],
    order: [['fecha', 'DESC']],
    limit: 10,
  });

  // Logros del niño
  const logros = await LogroUsuario.findAll({
    where: { usuario_id: id },
    include: [{ model: Logro, as: 'logro' }],
    order: [['fecha_obtenido', 'DESC']],
  });

  res.json({
    perfil,
    niveles_area: {
      percepcion:  perfil.nivel_percepcion,
      cognitiva:   perfil.nivel_cognitivo,
      lenguaje:    perfil.nivel_lenguaje,
      lectomatem:  perfil.nivel_lectomatem,
      social:      perfil.nivel_social,
      vida_diaria: perfil.nivel_vida_diaria,
    },
    // Submétricas de Lectoscritura y Matemáticas (v4)
    niveles_lectomatem: {
      lectura:     perfil.nivel_lectura     || 0,
      escritura:   perfil.nivel_escritura   || 0,
      matematicas: perfil.nivel_matematicas || 0,
    },
    // Configuración de audio personalizada (v5)
    config_audio: {
      activo:           perfil.audio_activo,
      velocidad:        perfil.audio_velocidad,
      leer_opciones:    perfil.audio_leer_opciones,
      repetir_pregunta: perfil.audio_repetir_pregunta,
    },
    puntos_totales: perfil.puntos_totales,
    racha_dias:     perfil.racha_dias,
    actividades_recientes: progresos.slice(0, 10),
    emociones_recientes:   emociones,
    logros,
    total_completadas: progresos.length,
  });
};

// ── Eliminar relación (no borra al niño) ──────────
const eliminarRelacion = async (req, res) => {
  const { id } = req.params;
  const relacion = await Relacion.findOne({
    where: { adulto_id: req.usuarioId, nino_id: id, activo: true },
  });
  if (!relacion) return res.status(404).json({ error: 'Relación no encontrada' });
  await relacion.update({ activo: false });
  res.json({ mensaje: 'Relación eliminada' });
};

module.exports = { crearNino, misNinos, obtenerNino, actualizarNino, progresoNino, eliminarRelacion };
