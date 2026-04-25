const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RedApoyo = sequelize.define('RedApoyo', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  tipo: {
    type: DataTypes.ENUM('terapeuta','psicologo','colegio','institucion','fundacion','medico','otro'),
    allowNull: false,
  },
  descripcion:    { type: DataTypes.TEXT, allowNull: true },
  especialidades: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('especialidades'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('especialidades', JSON.stringify(v)); },
  },
  ciudad:         { type: DataTypes.STRING(80), allowNull: true },
  departamento:   { type: DataTypes.STRING(80), allowNull: true },
  pais:           { type: DataTypes.STRING(50), defaultValue: 'Colombia' },
  direccion:      { type: DataTypes.STRING(200), allowNull: true },
  telefono:       { type: DataTypes.STRING(30), allowNull: true },
  email:          { type: DataTypes.STRING(150), allowNull: true },
  sitio_web:      { type: DataTypes.STRING(200), allowNull: true },
  emoji:          { type: DataTypes.STRING(10), defaultValue: '🏥' },
  color_tipo:     { type: DataTypes.STRING(20), defaultValue: '#4C7EF3' },
  color_fondo:    { type: DataTypes.STRING(20), defaultValue: '#EBF1FF' },
  atiende_virtual: { type: DataTypes.BOOLEAN, defaultValue: false },
  atiende_presencial: { type: DataTypes.BOOLEAN, defaultValue: true },
  cubre_eps:      { type: DataTypes.BOOLEAN, defaultValue: false },
  verified:       { type: DataTypes.BOOLEAN, defaultValue: false },
  activo:         { type: DataTypes.BOOLEAN, defaultValue: true },
  calificacion:   { type: DataTypes.FLOAT, defaultValue: 0, validate: { min: 0, max: 5 } },
  num_resenas:    { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'red_apoyo', timestamps: true, paranoid: true });

module.exports = RedApoyo;
