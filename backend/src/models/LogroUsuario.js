const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogroUsuario = sequelize.define('LogroUsuario', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuario_id: { type: DataTypes.UUID, allowNull: false },
  logro_id:   { type: DataTypes.UUID, allowNull: false },
  fecha_obtenido: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  notificado:     { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'logros_usuarios', timestamps: true });

module.exports = LogroUsuario;
