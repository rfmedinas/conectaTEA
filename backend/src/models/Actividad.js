const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Actividad = sequelize.define('Actividad', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  area_id: { type: DataTypes.UUID, allowNull: true },
  titulo:  { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  tipo: {
    // 'vision' se mantiene por compatibilidad; 'diversion' es el nuevo nombre
    // Nuevos tipos para subcarpetas de lectomatem: 'lectura', 'escritura'
    type: DataTypes.ENUM(
      'juego','cuento','pictos','emocion','rutina','comunicacion',
      'sensorial','vision','diversion',
      'matematicas','lenguaje','lectura','escritura',
      'social','vida_diaria'
    ),
    allowNull: false,
    defaultValue: 'juego',
  },
  // Subcarpeta: agrupa actividades dentro de un área
  // Para lectomatem: 'Lectura' | 'Escritura' | 'Matemáticas'
  subcarpeta: {
    type: DataTypes.STRING(60),
    allowNull: true,
    comment: 'Agrupa actividades. Ej: Lectura, Escritura, Matemáticas',
  },
  nivel: {
    type: DataTypes.ENUM('basico','intermedio','avanzado'),
    allowNull: false,
    defaultValue: 'basico',
  },
  duracion_min: { type: DataTypes.INTEGER, defaultValue: 10, validate: { min: 1, max: 120 } },
  emoji:  { type: DataTypes.STRING(10), defaultValue: '🎮' },
  imagen_url:  { type: DataTypes.STRING, allowNull: true },

  // ── CAMPOS DE AUDIO (v5) ─────────────────────────────────
  // audio_url: archivo MP3 pregrabado para la instrucción principal
  audio_url:   { type: DataTypes.STRING, allowNull: true,
    comment: 'URL del audio MP3 con la instrucción de la actividad' },

  // audio_instruccion: texto que el TTS debe leer al iniciar la actividad
  audio_instruccion: { type: DataTypes.TEXT, allowNull: true,
    comment: 'Texto completo para TTS al iniciar la actividad. Si es null se usa descripcion.' },

  // tts_habilitado: si false, la actividad no tiene soporte de audio
  tts_habilitado: { type: DataTypes.BOOLEAN, defaultValue: true,
    comment: 'Habilitar lectura en voz alta (TTS) en esta actividad' },

  // tts_leer_opciones: si true, el sistema lee cada opción de respuesta automáticamente
  tts_leer_opciones: { type: DataTypes.BOOLEAN, defaultValue: true,
    comment: 'Leer en voz alta cada opción de respuesta' },

  // velocidad_audio: 0.5 (muy lento) a 1.5 (rápido). null = usa preferencia del niño
  velocidad_audio: { type: DataTypes.FLOAT, allowNull: true,
    validate: { min: 0.3, max: 2.0 },
    comment: 'Velocidad de lectura sugerida para esta actividad. null = preferencia del niño' },
  // ─────────────────────────────────────────────────────────

  color_fondo: { type: DataTypes.STRING(20), defaultValue: '#EBF1FF' },
  // Preguntas/contenido JSON
  contenido: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('contenido'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('contenido', JSON.stringify(v)); },
  },
  activa:       { type: DataTypes.BOOLEAN, defaultValue: true },
  destacada:    { type: DataTypes.BOOLEAN, defaultValue: false },
  veces_jugada: { type: DataTypes.INTEGER, defaultValue: 0 },
  puntos_max:   { type: DataTypes.INTEGER, defaultValue: 100 },
  creado_por:   { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'actividades',
  timestamps: true,
  paranoid: true,
});

module.exports = Actividad;
