const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Informe = sequelize.define('Informe', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nino_id:   { type: DataTypes.UUID, allowNull: false },
  autor_id:  { type: DataTypes.UUID, allowNull: false },
  titulo:    { type: DataTypes.STRING(200), allowNull: false },
  tipo: {
    type: DataTypes.ENUM('progreso','seguimiento','evaluacion_inicial','plan_trabajo','incidente','observacion'),
    defaultValue: 'progreso',
  },
  periodo:   { type: DataTypes.STRING(100), allowNull: true },
  // Áreas evaluadas
  areas_evaluadas: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('areas_evaluadas'); return r ? JSON.parse(r) : []; },
    set(v) { this.setDataValue('areas_evaluadas', JSON.stringify(v)); },
  },
  // Secciones del informe
  logros:           { type: DataTypes.TEXT, allowNull: true },
  dificultades:     { type: DataTypes.TEXT, allowNull: true },
  recomendaciones:  { type: DataTypes.TEXT, allowNull: true },
  objetivos:        { type: DataTypes.TEXT, allowNull: true },
  observaciones:    { type: DataTypes.TEXT, allowNull: true },
  // Datos de progreso cuantitativo por área
  datos_progreso: {
    type: DataTypes.TEXT,
    get() { const r = this.getDataValue('datos_progreso'); return r ? JSON.parse(r) : {}; },
    set(v) { this.setDataValue('datos_progreso', JSON.stringify(v)); },
  },
  // URL del PDF generado
  pdf_url:  { type: DataTypes.STRING, allowNull: true },
  // Control de acceso
  visible_para_familia: { type: DataTypes.BOOLEAN, defaultValue: true },
  enviado_familia:      { type: DataTypes.BOOLEAN, defaultValue: false },
  fecha_envio:          { type: DataTypes.DATE, allowNull: true },
  borrador:             { type: DataTypes.BOOLEAN, defaultValue: false },
  fecha_informe:        { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
}, { tableName: 'informes', timestamps: true, paranoid: true });

module.exports = Informe;
