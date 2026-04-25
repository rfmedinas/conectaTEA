const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 80] },
  },
  apellido: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 80] },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true, // null para niños (sin auth)
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true, // null para niños
  },
  rol: {
    type: DataTypes.ENUM('nino', 'padre', 'terapeuta', 'docente', 'admin'),
    allowNull: false,
    defaultValue: 'nino',
  },
  avatar: {
    type: DataTypes.STRING(10),
    defaultValue: '🧒',
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  token_verificacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_reset: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_reset_expira: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Configuración accesibilidad TEA
  config: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const raw = this.getDataValue('config');
      return raw ? JSON.parse(raw) : {
        altoContraste: false,
        animacionesReducidas: false,
        textoGrande: true,
        tts: true,
        sonidos: true,
        pictogramosVisibles: true,
      };
    },
    set(val) {
      this.setDataValue('config', JSON.stringify(val));
    },
  },
}, {
  tableName: 'usuarios',
  timestamps: true,
  paranoid: true, // soft delete
  hooks: {
    beforeCreate: async (u) => {
      if (u.password_hash) {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        u.password_hash = await bcrypt.hash(u.password_hash, rounds);
      }
    },
    beforeUpdate: async (u) => {
      if (u.changed('password_hash') && u.password_hash) {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        u.password_hash = await bcrypt.hash(u.password_hash, rounds);
      }
    },
  },
});

// Instancia: comparar password
Usuario.prototype.verificarPassword = async function(plain) {
  if (!this.password_hash) return false;
  return bcrypt.compare(plain, this.password_hash);
};

// Instancia: datos seguros (sin password)
Usuario.prototype.toJSON = function() {
  const v = { ...this.get() };
  delete v.password_hash;
  delete v.token_verificacion;
  delete v.token_reset;
  delete v.token_reset_expira;
  return v;
};

module.exports = Usuario;
