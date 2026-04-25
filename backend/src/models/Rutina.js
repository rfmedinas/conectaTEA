// ══ RUTINA ══
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rutina = sequelize.define('Rutina', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nino_id: { type: DataTypes.UUID, allowNull: true },
  nombre:  { type: DataTypes.STRING(100), allowNull: false },
  emoji:   { type: DataTypes.STRING(10), defaultValue: '📅' },
  color:   { type: DataTypes.STRING(20), defaultValue: '#4C7EF3' },
  hora_inicio: { type: DataTypes.STRING(10), allowNull: true },
  dias: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('dias'); return r ? JSON.parse(r) : ['lunes','martes','miercoles','jueves','viernes']; },
    set(v) { this.setDataValue('dias', JSON.stringify(v)); },
  },
  es_publica:   { type: DataTypes.BOOLEAN, defaultValue: false },
  activa:        { type: DataTypes.BOOLEAN, defaultValue: true },
  creado_por:    { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'rutinas', timestamps: true, paranoid: true });

module.exports = Rutina;
