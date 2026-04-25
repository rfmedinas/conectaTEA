// ── RUTINAS ──────────────────────────────────────
const express = require('express');
const rutinaCtrl = require('../controllers/rutina.controller');
const { autenticar, autenticarOpcional } = require('../middlewares/auth');

const rutinaRouter = express.Router();
rutinaRouter.get('/',                   autenticarOpcional, rutinaCtrl.listar);
rutinaRouter.get('/:id',                autenticarOpcional, rutinaCtrl.obtener);
rutinaRouter.post('/',                  autenticar,         rutinaCtrl.crear);
rutinaRouter.put('/:id',                autenticar,         rutinaCtrl.actualizar);
rutinaRouter.delete('/:id',             autenticar,         rutinaCtrl.eliminar);
rutinaRouter.post('/:id/pasos',         autenticar,         rutinaCtrl.agregarPaso);
rutinaRouter.delete('/:id/pasos/:paso_id', autenticar,      rutinaCtrl.eliminarPaso);
module.exports.rutinaRouter = rutinaRouter;
