const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Material = sequelize.define('Material', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  autor_id: { type: DataTypes.UUID, allowNull: false },
  titulo:   { type: DataTypes.STRING(200), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  tipo: {
    type: DataTypes.ENUM('fichas','guias','videos','pictogramas','evaluaciones','otros'),
    allowNull: false,
    defaultValue: 'fichas',
  },
  area: {
    type: DataTypes.ENUM('todas','percepcion','cognitiva','lenguaje','lectomatem','social','vida_diaria'),
    defaultValue: 'todas',
  },
  nivel: {
    type: DataTypes.ENUM('todas','basico','intermedio','avanzado'),
    defaultValue: 'todas',
  },
  archivo_url:  { type: DataTypes.STRING, allowNull: true },
  archivo_nombre:{ type: DataTypes.STRING, allowNull: true },
  archivo_size:  { type: DataTypes.INTEGER, defaultValue: 0 },
  formato:      { type: DataTypes.STRING(10), defaultValue: 'PDF' },
  emoji:        { type: DataTypes.STRING(10), defaultValue: '📄' },
  color_fondo:  { type: DataTypes.STRING(20), defaultValue: '#EBF1FF' },
  descargas:    { type: DataTypes.INTEGER, defaultValue: 0 },
  activo:       { type: DataTypes.BOOLEAN, defaultValue: true },
  aprobado:     { type: DataTypes.BOOLEAN, defaultValue: true },
  // Quién puede descargar
  acceso: {
    type: DataTypes.ENUM('todos','profesionales','solo_autores'),
    defaultValue: 'todos',
  },
  tags: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('tags'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('tags', JSON.stringify(v)); },
  },
}, { tableName: 'materiales', timestamps: true, paranoid: true });

module.exports = Material;
