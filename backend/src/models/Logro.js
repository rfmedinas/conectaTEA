const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ── LOGRO ──
const Logro = sequelize.define('Logro', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nombre:      { type: DataTypes.STRING(100), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  emoji:       { type: DataTypes.STRING(10), defaultValue: '🏆' },
  color:       { type: DataTypes.STRING(20), defaultValue: '#FFB347' },
  condicion_tipo: {
    type: DataTypes.ENUM('actividades','racha','emociones','material','chat','perfil','admin'),
    allowNull: false,
  },
  condicion_valor: { type: DataTypes.INTEGER, defaultValue: 1 },
  puntos:      { type: DataTypes.INTEGER, defaultValue: 50 },
  activo:      { type: DataTypes.BOOLEAN, defaultValue: true },
  orden:       { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'logros', timestamps: true });

module.exports = Logro;
