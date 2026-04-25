const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  autor_id:  { type: DataTypes.UUID, allowNull: true },
  titulo:    { type: DataTypes.STRING(250), allowNull: false },
  slug:      { type: DataTypes.STRING(250), allowNull: false, unique: true },
  resumen:   { type: DataTypes.TEXT, allowNull: true },
  contenido: { type: DataTypes.TEXT, allowNull: false },
  categoria: {
    type: DataTypes.ENUM('guias','tips','investigacion','recursos','historias','noticias'),
    defaultValue: 'guias',
  },
  emoji:        { type: DataTypes.STRING(10), defaultValue: '📰' },
  imagen_url:   { type: DataTypes.STRING, allowNull: true },
  color_fondo:  { type: DataTypes.STRING(20), defaultValue: '#EBF1FF' },
  color_acento: { type: DataTypes.STRING(20), defaultValue: '#4C7EF3' },
  tiempo_lectura: { type: DataTypes.STRING(20), defaultValue: '5 min' },
  autor_nombre:   { type: DataTypes.STRING(100), allowNull: true },
  publicado:      { type: DataTypes.BOOLEAN, defaultValue: true },
  destacado:      { type: DataTypes.BOOLEAN, defaultValue: false },
  vistas:         { type: DataTypes.INTEGER, defaultValue: 0 },
  tags: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('tags'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('tags', JSON.stringify(v)); },
  },
  fecha_publicacion: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
}, { tableName: 'blog_posts', timestamps: true, paranoid: true });

module.exports = BlogPost;
