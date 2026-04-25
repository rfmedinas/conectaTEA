const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

const MB = 1024 * 1024;
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB) || 20;

// Tipos permitidos por carpeta
const TIPOS = {
  material:  ['pdf','docx','doc','pptx','xlsx','png','jpg','jpeg','gif','mp4','webm','zip','rar'],
  avatares:  ['png','jpg','jpeg','gif','webp'],
  informes:  ['pdf'],
  audio:     ['mp3','wav','ogg','m4a'],
};

function crearStorage(carpeta) {
  const dest = path.join(__dirname, '..', '..', 'uploads', carpeta);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const name = `${uuidv4()}${ext}`;
      cb(null, name);
    },
  });
}

function filtro(tiposPermitidos) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (tiposPermitidos.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: .${ext}. Permitidos: ${tiposPermitidos.join(', ')}`), false);
    }
  };
}

// Exporta middlewares listos
const subirMaterial = multer({
  storage: crearStorage('material'),
  limits:  { fileSize: MAX_MB * MB },
  fileFilter: filtro(TIPOS.material),
}).single('archivo');

const subirAvatar = multer({
  storage: crearStorage('avatares'),
  limits:  { fileSize: 5 * MB },
  fileFilter: filtro(TIPOS.avatares),
}).single('avatar');

const subirAudio = multer({
  storage: crearStorage('audio'),
  limits:  { fileSize: 10 * MB },
  fileFilter: filtro(TIPOS.audio),
}).single('audio');

// Wrapper que convierte callback de multer a promesa
function promisifyUpload(upload) {
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  };
}

module.exports = {
  subirMaterial:  promisifyUpload(subirMaterial),
  subirAvatar:    promisifyUpload(subirAvatar),
  subirAudio:     promisifyUpload(subirAudio),
};
