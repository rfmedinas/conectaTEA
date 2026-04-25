// ══ NINO.JS ══
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Nino = sequelize.define('Nino', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuario_id: { type: DataTypes.UUID, allowNull: false },
  nombre_preferido: { type: DataTypes.STRING(50), allowNull: true },
  fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: true },
  edad: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 25 } },
  nivel_tea: {
    type: DataTypes.ENUM('1_leve', '2_moderado', '3_severo'),
    defaultValue: '2_moderado',
  },
  tipo_comunicacion: {
    type: DataTypes.ENUM('verbal', 'no_verbal', 'mixto_caa'),
    defaultValue: 'verbal',
  },
  intereses: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('intereses'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('intereses', JSON.stringify(v)); },
  },
  sensibilidades: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('sensibilidades'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('sensibilidades', JSON.stringify(v)); },
  },
  diagnostico_fecha: { type: DataTypes.DATEONLY, allowNull: true },
  observaciones: { type: DataTypes.TEXT, allowNull: true },
  foto_perfil: { type: DataTypes.STRING, allowNull: true },
  // Niveles por área (0-100)
  nivel_percepcion:  { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  nivel_cognitivo:   { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  nivel_lenguaje:    { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  nivel_lectomatem:  { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  // Submétricas de lectomatem (v4) — desglosan el nivel general
  nivel_lectura:     { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  nivel_escritura:   { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  nivel_matematicas: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  nivel_social:      { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  nivel_vida_diaria: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0, max: 100 } },
  puntos_totales:    { type: DataTypes.INTEGER, defaultValue: 0 },
  racha_dias:        { type: DataTypes.INTEGER, defaultValue: 0 },

  // ── PREFERENCIAS DE AUDIO (v5) ──────────────────────────
  audio_activo:      { type: DataTypes.BOOLEAN, defaultValue: true,
    comment: 'El niño usa lectura en voz alta durante las actividades' },
  audio_velocidad:   { type: DataTypes.FLOAT, defaultValue: 0.82,
    validate: { min: 0.3, max: 2.0 },
    comment: 'Velocidad de lectura TTS: 0.65=muy lento, 0.82=lento, 1.0=normal' },
  audio_leer_opciones: { type: DataTypes.BOOLEAN, defaultValue: true,
    comment: 'Leer automáticamente cada opción de respuesta' },
  audio_repetir_pregunta: { type: DataTypes.BOOLEAN, defaultValue: true,
    comment: 'Mostrar botón grande para repetir la pregunta' },
  // ────────────────────────────────────────────────────────
  ultimo_acceso:     { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'ninos', timestamps: true, paranoid: true });

module.exports = Nino;
