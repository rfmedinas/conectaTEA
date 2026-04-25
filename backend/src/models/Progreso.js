// ══ PROGRESO.JS ══
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Progreso = sequelize.define('Progreso', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nino_id:      { type: DataTypes.UUID, allowNull: false },
  actividad_id: { type: DataTypes.UUID, allowNull: false },
  completada:   { type: DataTypes.BOOLEAN, defaultValue: false },
  intentos:     { type: DataTypes.INTEGER, defaultValue: 1 },
  puntuacion:   { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  tiempo_seg:   { type: DataTypes.INTEGER, defaultValue: 0 },
  respuestas:   {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('respuestas'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('respuestas', JSON.stringify(v)); },
  },
  nivel_jugado: { type: DataTypes.ENUM('basico','intermedio','avanzado'), defaultValue: 'basico' },
  fecha:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  notas:        { type: DataTypes.TEXT, allowNull: true },
  // ── DATOS DE AUDIO (v5) ──────────────────────────────────
  uso_audio:         { type: DataTypes.BOOLEAN, defaultValue: false,
    comment: 'El niño activó el audio durante esta sesión' },
  veces_repitio:     { type: DataTypes.INTEGER, defaultValue: 0,
    comment: 'Cuántas veces tocó el botón de repetir la pregunta' },
  velocidad_usada:   { type: DataTypes.FLOAT, allowNull: true,
    comment: 'Velocidad de audio que usó el niño en esta sesión' },
  // ────────────────────────────────────────────────────────
}, { tableName: 'progresos', timestamps: true });

module.exports = Progreso;
