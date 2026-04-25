// src/models/VideoVisto.js — ConectaTEA v6
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VideoVisto = sequelize.define('VideoVisto', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nino_id:     { type: DataTypes.UUID, allowNull: false },
  video_id:    { type: DataTypes.UUID, allowNull: false },
  duracion_seg:{ type: DataTypes.INTEGER, defaultValue: 0,
                 comment: 'Segundos que vio antes de cerrar' },
  completado:  { type: DataTypes.BOOLEAN, defaultValue: false,
                 comment: 'Vio al menos el 80% del video' },
  reaccion:    { type: DataTypes.ENUM('me_gusto','no_me_gusto','neutro'), allowNull: true },
  fecha:       { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'videos_vistos',
  timestamps: true,
});

module.exports = VideoVisto;
