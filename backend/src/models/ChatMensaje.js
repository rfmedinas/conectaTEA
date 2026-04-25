const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatMensaje = sequelize.define('ChatMensaje', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuario_id: { type: DataTypes.UUID, allowNull: true },
  canal: {
    type: DataTypes.ENUM('general','experiencias','preguntas'),
    defaultValue: 'general',
  },
  texto:      { type: DataTypes.TEXT, allowNull: false },
  tipo: {
    type: DataTypes.ENUM('texto','imagen','archivo','sistema'),
    defaultValue: 'texto',
  },
  archivo_url: { type: DataTypes.STRING, allowNull: true },
  es_experiencia: { type: DataTypes.BOOLEAN, defaultValue: false },
  editado:    { type: DataTypes.BOOLEAN, defaultValue: false },
  eliminado:  { type: DataTypes.BOOLEAN, defaultValue: false },
  autor_nombre: { type: DataTypes.STRING(100), allowNull: true },
  autor_avatar: { type: DataTypes.STRING(10), defaultValue: '😊' },
  autor_rol:    { type: DataTypes.STRING(20), defaultValue: 'padre' },
}, { tableName: 'chat_mensajes', timestamps: true });

module.exports = ChatMensaje;
