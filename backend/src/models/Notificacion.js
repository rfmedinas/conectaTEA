const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuario_id: { type: DataTypes.UUID, allowNull: false },
  tipo: {
    type: DataTypes.ENUM('logro','progreso','informe','mensaje','blog','sistema','rutina','recordatorio'),
    defaultValue: 'sistema',
  },
  titulo:  { type: DataTypes.STRING(150), allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: true },
  emoji:   { type: DataTypes.STRING(10), defaultValue: '🔔' },
  color_fondo: { type: DataTypes.STRING(20), defaultValue: '#EBF1FF' },
  leida:   { type: DataTypes.BOOLEAN, defaultValue: false },
  url:     { type: DataTypes.STRING(200), allowNull: true },
  datos_extra: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('datos_extra'); return r ? JSON.parse(r) : {}; },
    set(v) { this.setDataValue('datos_extra', JSON.stringify(v)); },
  },
}, { tableName: 'notificaciones', timestamps: true });

module.exports = Notificacion;
