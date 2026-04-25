// ══ EMOCION.JS ══
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Emocion = sequelize.define('Emocion', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false },
  emoji:  { type: DataTypes.STRING(10), allowNull: false },
  color:  { type: DataTypes.STRING(20), defaultValue: '#FFB347' },
  color_fondo: { type: DataTypes.STRING(20), defaultValue: '#FFF6E8' },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  categoria: {
    type: DataTypes.ENUM('basica','compleja','corporal'),
    defaultValue: 'basica',
  },
  estrategias: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('estrategias'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('estrategias', JSON.stringify(v)); },
  },
  audio_url:  { type: DataTypes.STRING, allowNull: true },
  imagen_url: { type: DataTypes.STRING, allowNull: true },
  activa:     { type: DataTypes.BOOLEAN, defaultValue: true },
  orden:      { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'emociones', timestamps: true });

module.exports = Emocion;
