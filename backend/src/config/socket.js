/**
 * Socket.io — Chat en tiempo real
 * Maneja: chat de padres, notificaciones, mensajes
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Auth middleware socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Niños entran sin token
      socket.user = { id: null, rol: 'nino', nombre: 'Niño/a' };
      return next();
    }
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', socket => {
    const userId = socket.user?.id || 'anon';
    logger.info(`Socket conectado: ${socket.id} | user: ${userId}`);

    // Unirse a sala personal
    if (socket.user?.id) socket.join(`user_${socket.user.id}`);

    // ── CHAT PADRES ──
    socket.on('chat:unirse', ({ canal }) => {
      socket.join(`chat_${canal}`);
      socket.emit('chat:bienvenida', { canal, msg: `Te uniste al canal ${canal}` });
    });

    socket.on('chat:mensaje', async (data) => {
      const { canal, texto, tipo } = data;
      if (!texto?.trim()) return;

      const mensaje = {
        id: Date.now(),
        de: socket.user?.nombre || 'Anónimo',
        ava: socket.user?.avatar || '😊',
        userId: socket.user?.id,
        rol: socket.user?.rol,
        texto: texto.trim().substring(0, 1000),
        canal,
        tipo: tipo || 'general',
        timestamp: new Date().toISOString(),
      };

      // Broadcast al canal
      io.to(`chat_${canal}`).emit('chat:nuevo_mensaje', mensaje);
      logger.info(`Chat [${canal}]: ${socket.user?.nombre} — "${texto.substring(0,50)}"`);
    });

    socket.on('chat:escribiendo', ({ canal }) => {
      socket.to(`chat_${canal}`).emit('chat:usuario_escribe', {
        usuario: socket.user?.nombre,
      });
    });

    // ── NOTIFICACIONES ──
    socket.on('notif:marcar_leida', ({ notifId }) => {
      socket.emit('notif:actualizada', { notifId, leida: true });
    });

    // ── ACTIVIDAD EN TIEMPO REAL (terapeuta ve al niño) ──
    socket.on('actividad:progreso', ({ ninoId, actividadId, paso, correcto }) => {
      if (socket.user?.rol === 'nino') {
        io.emit(`seguimiento_${ninoId}`, { actividadId, paso, correcto });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket desconectado: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.io inicializado');
  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
}

function emitirNotificacion(userId, datos) {
  if (io) io.to(`user_${userId}`).emit('notif:nueva', datos);
}

module.exports = { initSocket, getIO, emitirNotificacion };
