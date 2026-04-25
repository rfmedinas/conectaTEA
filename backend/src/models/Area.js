// ══ AREA.JS ══
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Area = sequelize.define('Area', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  slug:   { type: DataTypes.STRING(50), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  icono:  { type: DataTypes.STRING(10), defaultValue: '📚' },
  color:  { type: DataTypes.STRING(20), defaultValue: '#4C7EF3' },
  gradiente: { type: DataTypes.STRING(100), allowNull: true },
  orden:  { type: DataTypes.INTEGER, defaultValue: 0 },
  activa: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'areas', timestamps: true });

module.exports = Area;
