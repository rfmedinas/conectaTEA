/**
 * ConectaTEA Backend — Servidor Principal
 * Express + Socket.io + Sequelize
 */
require('express-async-errors');
require('dotenv').config();

const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');
const path       = require('path');

const { sequelize } = require('./config/database');
const logger        = require('./config/logger');
const { initSocket } = require('./config/socket');
const errorHandler  = require('./middlewares/errorHandler');
const rateLimiter   = require('./middlewares/rateLimiter');

// ── Routers ──
const authRoutes          = require('./routes/auth.routes');
const usuarioRoutes       = require('./routes/usuario.routes');
const ninoRoutes          = require('./routes/nino.routes');
const actividadRoutes     = require('./routes/actividad.routes');
const areaRoutes          = require('./routes/area.routes');
const emocionRoutes       = require('./routes/emocion.routes');
const { rutinaRouter: rutinaRoutes } = require('./routes/rutina.routes');
const progresoRoutes      = require('./routes/progreso.routes');
const materialRoutes      = require('./routes/material.routes');
const informeRoutes       = require('./routes/informe.routes');
const { blogRouter: blogRoutes } = require('./routes/blog.routes');
const chatRoutes          = require('./routes/chat.routes');
const redApoyoRoutes      = require('./routes/redApoyo.routes');
const pictogramaRoutes    = require('./routes/pictograma.routes');
const notificacionRoutes  = require('./routes/notificacion.routes');
const logroRoutes         = require('./routes/logro.routes');
const audioRoutes         = require('./routes/audio.routes'); // v5 — Sistema de audio TTS
const videoRoutes         = require('./routes/video.routes');  // v6 — Videos YouTube

const app    = express();
const server = http.createServer(app);

// ══════════════════════════════════════
//  MIDDLEWARES GLOBALES
// ══════════════════════════════════════
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
  ],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', {
  stream: { write: msg => logger.info(msg.trim()) },
}));

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rate limiting
app.use('/api/', rateLimiter.general);
app.use('/api/auth/', rateLimiter.auth);

// ══════════════════════════════════════
//  RUTAS API
// ══════════════════════════════════════
const API = '/api/v1';

app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/usuarios`,      usuarioRoutes);
app.use(`${API}/ninos`,         ninoRoutes);
app.use(`${API}/actividades`,   actividadRoutes);
app.use(`${API}/areas`,         areaRoutes);
app.use(`${API}/emociones`,     emocionRoutes);
app.use(`${API}/rutinas`,       rutinaRoutes);
app.use(`${API}/progreso`,      progresoRoutes);
app.use(`${API}/material`,      materialRoutes);
app.use(`${API}/informes`,      informeRoutes);
app.use(`${API}/blog`,          blogRoutes);
app.use(`${API}/chat`,          chatRoutes);
app.use(`${API}/red-apoyo`,     redApoyoRoutes);
app.use(`${API}/pictogramas`,   pictogramaRoutes);
app.use(`${API}/notificaciones`,notificacionRoutes);
app.use(`${API}/logros`,        logroRoutes);
app.use(`${API}/audio`,         audioRoutes);  // v5 — Sistema de audio TTS
app.use(`${API}/videos`,        videoRoutes);  // v6 — Videos YouTube

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  app: 'ConectaTEA API',
  version: '1.0.0',
  env: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Error handler global
app.use(errorHandler);

// ══════════════════════════════════════
//  SOCKET.IO
// ══════════════════════════════════════
initSocket(server);

// ══════════════════════════════════════
//  INICIAR SERVIDOR
// ══════════════════════════════════════
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexión a base de datos exitosa');

    // Sync tablas (alter:true en dev, false en prod)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    logger.info('✅ Tablas sincronizadas');

    server.listen(PORT, () => {
      logger.info(`🚀 ConectaTEA API corriendo en http://localhost:${PORT}`);
      logger.info(`📡 Entorno: ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    logger.error('❌ Error iniciando servidor:', err);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server };
