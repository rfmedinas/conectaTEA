// ── BLOG ─────────────────────────────────────────
const { Router } = require('express');
const blogCtrl = require('../controllers/blog.controller');
const { autenticar, autenticarOpcional, soloProfesionales } = require('../middlewares/auth');

const blogRouter = Router();
blogRouter.get('/',                autenticarOpcional, blogCtrl.listar);
blogRouter.get('/:idOrSlug',       autenticarOpcional, blogCtrl.obtener);
blogRouter.post('/',               autenticar, soloProfesionales, blogCtrl.crear);
blogRouter.put('/:id',             autenticar, soloProfesionales, blogCtrl.actualizar);
blogRouter.delete('/:id',          autenticar, soloProfesionales, blogCtrl.eliminar);

module.exports.blogRouter = blogRouter;
