const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tablero = sequelize.define('Tablero', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nombre:     { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Mi tablero' },
  nino_id:    { type: DataTypes.UUID, allowNull: true },
  creado_por: { type: DataTypes.UUID, allowNull: true },
  es_publico: { type: DataTypes.BOOLEAN, defaultValue: false },
  // orden JSON de pictos actualmente seleccionados
  pictos_seleccionados: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('pictos_seleccionados'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('pictos_seleccionados', JSON.stringify(v)); },
  },
}, { tableName: 'tableros', timestamps: true });

module.exports = Tablero;
