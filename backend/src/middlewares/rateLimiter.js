const rateLimit = require('express-rate-limit');

const general = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.' },
  skip: (req) => req.path === '/health',
});

// Más estricto para auth (evitar fuerza bruta)
const auth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de autenticación. Intenta en 15 minutos.' },
});

// Para uploads
const uploads = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Límite de subidas alcanzado. Intenta en una hora.' },
});

module.exports = { general, auth, uploads };
