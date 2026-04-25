// ══ REGISTRO EMOCION ══
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RegistroEmocion = sequelize.define('RegistroEmocion', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nino_id:    { type: DataTypes.UUID, allowNull: false },
  emocion_id: { type: DataTypes.UUID, allowNull: false },
  intensidad: { type: DataTypes.INTEGER, defaultValue: 3, validate: { min: 1, max: 5 } },
  contexto: {
    type: DataTypes.ENUM('casa','colegio','terapia','parque','otro'),
    defaultValue: 'casa',
  },
  nota:  { type: DataTypes.TEXT, allowNull: true },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'registro_emociones', timestamps: true });

module.exports = RegistroEmocion;
