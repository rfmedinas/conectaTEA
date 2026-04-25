const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pictograma = sequelize.define('Pictograma', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  palabra:  { type: DataTypes.STRING(80), allowNull: false },
  categoria:{ type: DataTypes.STRING(50), allowNull: false },
  subcategoria: { type: DataTypes.STRING(50), allowNull: true },
  emoji:    { type: DataTypes.STRING(10), defaultValue: '🖼️' },
  imagen_url:{ type: DataTypes.STRING, allowNull: true },
  audio_url: { type: DataTypes.STRING, allowNull: true },
  color:     { type: DataTypes.STRING(20), defaultValue: '#4C7EF3' },
  color_fondo:{ type: DataTypes.STRING(20), defaultValue: '#EBF1FF' },
  tags: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('tags'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('tags', JSON.stringify(v)); },
  },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  orden:  { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'pictogramas', timestamps: true });

module.exports = Pictograma;
