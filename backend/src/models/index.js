/**
 * ConectaTEA — Modelos y Asociaciones
 * Centraliza todos los modelos Sequelize
 */
const { sequelize } = require('../config/database');

const Usuario      = require('./Usuario');
const Nino         = require('./Nino');
const Relacion     = require('./Relacion');
const Area         = require('./Area');
const Actividad    = require('./Actividad');
const Progreso     = require('./Progreso');
const Emocion      = require('./Emocion');
const RegistroEmo  = require('./RegistroEmocion');
const Rutina       = require('./Rutina');
const PasoRutina   = require('./PasoRutina');
const Pictograma   = require('./Pictograma');
const Tablero      = require('./Tablero');
const Material     = require('./Material');
const Informe      = require('./Informe');
const BlogPost     = require('./BlogPost');
const ChatMensaje  = require('./ChatMensaje');
const RedApoyo     = require('./RedApoyo');
const Logro        = require('./Logro');
const LogroUsuario = require('./LogroUsuario');
const Notificacion = require('./Notificacion');

// ══════════════════════════════════
//   ASOCIACIONES
// ══════════════════════════════════

// Usuario → Nino (padre puede tener varios niños, terapeuta también)
Usuario.hasMany(Relacion, { foreignKey: 'adulto_id', as: 'relaciones_adulto' });
Usuario.hasMany(Relacion, { foreignKey: 'nino_id',   as: 'relaciones_nino' });
Relacion.belongsTo(Usuario, { foreignKey: 'adulto_id', as: 'adulto' });
Relacion.belongsTo(Usuario, { foreignKey: 'nino_id',   as: 'nino' });

// Nino → Usuario (1:1)
Usuario.hasOne(Nino,  { foreignKey: 'usuario_id', as: 'perfil_nino' });
Nino.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Actividad → Area
Area.hasMany(Actividad,   { foreignKey: 'area_id', as: 'actividades' });
Actividad.belongsTo(Area, { foreignKey: 'area_id', as: 'area' });

// Progreso → Usuario (niño) + Actividad
Usuario.hasMany(Progreso,    { foreignKey: 'nino_id',       as: 'progresos' });
Actividad.hasMany(Progreso,  { foreignKey: 'actividad_id',  as: 'progresos' });
Progreso.belongsTo(Usuario,   { foreignKey: 'nino_id',      as: 'nino' });
Progreso.belongsTo(Actividad, { foreignKey: 'actividad_id', as: 'actividad' });

// RegistroEmocion → Usuario + Emocion
Usuario.hasMany(RegistroEmo,  { foreignKey: 'nino_id',    as: 'registros_emocion' });
Emocion.hasMany(RegistroEmo,  { foreignKey: 'emocion_id', as: 'registros' });
RegistroEmo.belongsTo(Usuario, { foreignKey: 'nino_id',   as: 'nino' });
RegistroEmo.belongsTo(Emocion, { foreignKey: 'emocion_id',as: 'emocion' });

// Rutina → PasoRutina
Rutina.hasMany(PasoRutina,     { foreignKey: 'rutina_id', as: 'pasos' });
PasoRutina.belongsTo(Rutina,   { foreignKey: 'rutina_id', as: 'rutina' });
// Rutina puede pertenecer a un niño específico o ser genérica
Usuario.hasMany(Rutina, { foreignKey: 'nino_id', as: 'rutinas' });
Rutina.belongsTo(Usuario, { foreignKey: 'nino_id', as: 'nino' });

// Tablero → Usuario (niño) + Pictogramas (M:N)
Usuario.hasMany(Tablero,   { foreignKey: 'nino_id',   as: 'tableros' });
Tablero.belongsTo(Usuario, { foreignKey: 'nino_id',   as: 'nino' });
Tablero.belongsTo(Usuario, { foreignKey: 'creado_por', as: 'creador' });
Tablero.belongsToMany(Pictograma, { through: 'tablero_pictogramas', as: 'pictogramas' });
Pictograma.belongsToMany(Tablero, { through: 'tablero_pictogramas', as: 'tableros' });

// Material → Usuario (autor)
Usuario.hasMany(Material,   { foreignKey: 'autor_id', as: 'materiales' });
Material.belongsTo(Usuario, { foreignKey: 'autor_id', as: 'autor' });

// Informe → Usuario (nino) + Usuario (autor)
Usuario.hasMany(Informe, { foreignKey: 'nino_id',   as: 'informes_nino' });
Usuario.hasMany(Informe, { foreignKey: 'autor_id',  as: 'informes_autor' });
Informe.belongsTo(Usuario, { foreignKey: 'nino_id',  as: 'nino' });
Informe.belongsTo(Usuario, { foreignKey: 'autor_id', as: 'autor' });

// BlogPost → Usuario (autor)
Usuario.hasMany(BlogPost,   { foreignKey: 'autor_id', as: 'posts' });
BlogPost.belongsTo(Usuario, { foreignKey: 'autor_id', as: 'autor' });

// ChatMensaje → Usuario
Usuario.hasMany(ChatMensaje,    { foreignKey: 'usuario_id', as: 'mensajes_chat' });
ChatMensaje.belongsTo(Usuario,  { foreignKey: 'usuario_id', as: 'usuario' });

// Logro → LogroUsuario (M:N via LogroUsuario)
Usuario.belongsToMany(Logro, { through: LogroUsuario, as: 'logros', foreignKey: 'usuario_id' });
Logro.belongsToMany(Usuario, { through: LogroUsuario, as: 'usuarios', foreignKey: 'logro_id' });

// Notificacion → Usuario
Usuario.hasMany(Notificacion,   { foreignKey: 'usuario_id', as: 'notificaciones' });
Notificacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

const Video      = require('./Video');
const VideoVisto = require('./VideoVisto');

// Asociaciones Video
Video.hasMany(VideoVisto,      { foreignKey:'video_id', as:'vistas' });
VideoVisto.belongsTo(Video,    { foreignKey:'video_id', as:'video' });
// Nino → Videos vistos (a través de usuario_id mapeado como nino_id)
VideoVisto.belongsTo(require('./Nino'), { foreignKey:'nino_id', as:'nino', constraints:false });

module.exports = {
  sequelize, Video, VideoVisto,
  Usuario, Nino, Relacion,
  Area, Actividad, Progreso,
  Emocion, RegistroEmo,
  Rutina, PasoRutina,
  Pictograma, Tablero,
  Material, Informe,
  BlogPost, ChatMensaje,
  RedApoyo,
  Logro, LogroUsuario,
  Notificacion,
};
