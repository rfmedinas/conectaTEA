const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Relacion = sequelize.define('Relacion', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  adulto_id: { type: DataTypes.UUID, allowNull: false },
  nino_id:   { type: DataTypes.UUID, allowNull: false },
  tipo: {
    type: DataTypes.ENUM('padre', 'madre', 'terapeuta', 'docente', 'cuidador'),
    allowNull: false,
  },
  activo:    { type: DataTypes.BOOLEAN, defaultValue: true },
  fecha_inicio: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
}, { tableName: 'relaciones', timestamps: true });

module.exports = Relacion;
