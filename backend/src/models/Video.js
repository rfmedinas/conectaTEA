// src/models/Video.js — ConectaTEA v6
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Video = sequelize.define('Video', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  youtube_id:  { type: DataTypes.STRING(20), allowNull: false, unique: true,
                 comment: 'ID del video en YouTube (parte de la URL)' },
  titulo:      { type: DataTypes.STRING(200), allowNull: false },
  subtitulo:   { type: DataTypes.STRING(300), allowNull: true },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  categoria:   {
    type: DataTypes.ENUM('canciones','cuentos','emociones','naturaleza','aprendizaje','relajacion','otro'),
    defaultValue: 'aprendizaje',
  },
  duracion:    { type: DataTypes.STRING(10), allowNull: true,
                 comment: 'Duración legible. Ej: 3:45' },
  duracion_seg:{ type: DataTypes.INTEGER, allowNull: true,
                 comment: 'Duración en segundos para filtros' },
  edad_min:    { type: DataTypes.INTEGER, defaultValue: 3 },
  edad_max:    { type: DataTypes.INTEGER, defaultValue: 12 },
  color_fondo: { type: DataTypes.STRING(20), defaultValue: '#EBF1FF' },
  nuevo:       { type: DataTypes.BOOLEAN, defaultValue: false },
  destacado:   { type: DataTypes.BOOLEAN, defaultValue: false },
  revisado:    { type: DataTypes.BOOLEAN, defaultValue: true,
                 comment: 'Revisado por terapeuta o docente para garantizar contenido adecuado' },
  veces_visto: { type: DataTypes.INTEGER, defaultValue: 0 },
  // Seguridad
  apto_tea:    { type: DataTypes.BOOLEAN, defaultValue: true,
                 comment: 'Verificado como apto para niños con TEA' },
  sin_anuncios:{ type: DataTypes.BOOLEAN, defaultValue: true,
                 comment: 'El embed se configura para minimizar anuncios' },
  // Quien lo agregó
  creado_por:  { type: DataTypes.UUID, allowNull: true },
  activo:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'videos',
  timestamps: true,
  paranoid: true,
});

module.exports = Video;
