const router   = require('express').Router();
const { autenticar, autorizar } = require('../middlewares/auth');
const { subirAvatar } = require('../middlewares/upload');
const { Usuario } = require('../models');

// GET  /api/v1/usuarios/:id
router.get('/:id', autenticar, async (req, res) => {
  if (req.params.id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin acceso' });
  }
  const u = await Usuario.findByPk(req.params.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  res.json({ usuario: u.toJSON() });
});

// PUT  /api/v1/usuarios/:id
router.put('/:id', autenticar, async (req, res) => {
  if (req.params.id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin acceso' });
  }
  const u = await Usuario.findByPk(req.params.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  const { nombre, apellido, avatar, config } = req.body;
  await u.update({ nombre, apellido, avatar, config });
  res.json({ mensaje: 'Perfil actualizado', usuario: u.toJSON() });
});

// POST /api/v1/usuarios/:id/avatar
router.post('/:id/avatar', autenticar, subirAvatar, async (req, res) => {
  if (req.params.id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin acceso' });
  }
  if (!req.file) return res.status(400).json({ error: 'Sin archivo' });
  const u = await Usuario.findByPk(req.params.id);
  const url = `/uploads/avatares/${req.file.filename}`;
  await u.update({ avatar_url: url });
  res.json({ mensaje: 'Avatar actualizado', avatar_url: url });
});

// DELETE /api/v1/usuarios/:id
router.delete('/:id', autenticar, autorizar('admin'), async (req, res) => {
  const u = await Usuario.findByPk(req.params.id);
  if (!u) return res.status(404).json({ error: 'No encontrado' });
  await u.update({ activo: false });
  res.json({ mensaje: 'Usuario desactivado' });
});

module.exports = router;
