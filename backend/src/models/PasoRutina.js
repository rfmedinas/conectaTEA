const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PasoRutina = sequelize.define('PasoRutina', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  rutina_id: { type: DataTypes.UUID, allowNull: false },
  orden:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  nombre:    { type: DataTypes.STRING(120), allowNull: false },
  icono:     { type: DataTypes.STRING(10), defaultValue: '✅' },
  imagen_url:{ type: DataTypes.STRING, allowNull: true },
  audio_url: { type: DataTypes.STRING, allowNull: true },
  duracion_seg: { type: DataTypes.INTEGER, defaultValue: 0 },
  obligatorio:  { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'pasos_rutina', timestamps: true });

module.exports = PasoRutina;
