/**
 * Informe Controller — ConectaTEA
 * CRUD informes + generación PDF con PDFKit
 */
const path = require('path');
const fs   = require('fs');
const PDFDocument = require('pdfkit');
const { Informe, Usuario, Nino, Relacion, Notificacion, Progreso,
        Actividad, Area } = require('../models');
const { emitirNotificacion } = require('../config/socket');
const logger = require('../config/logger');

// ── Listar informes (los que tengo acceso) ────────
const listar = async (req, res) => {
  const { nino_id, tipo, page = 1, limit = 15 } = req.query;
  const where = {};

  if (req.rol === 'padre') {
    // Padres ven solo los informes de sus hijos que están visibles para familia
    const relaciones = await Relacion.findAll({
      where: { adulto_id: req.usuarioId, activo: true },
      attributes: ['nino_id'],
    });
    const ninoIds = relaciones.map(r => r.nino_id);
    where.nino_id = ninoIds;
    where.visible_para_familia = true;
    where.borrador = false;
  } else {
    // Profesionales ven sus propios informes
    where.autor_id = req.usuarioId;
  }

  if (nino_id) where.nino_id = nino_id;
  if (tipo)    where.tipo    = tipo;

  const { rows, count } = await Informe.findAndCountAll({
    where,
    include: [
      { model: Usuario, as: 'nino',  attributes: ['id','nombre','apellido','avatar'] },
      { model: Usuario, as: 'autor', attributes: ['id','nombre','apellido','rol'] },
    ],
    order: [['createdAt','DESC']],
    limit:  parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
  });

  res.json({ informes: rows, total: count });
};

// ── Crear / guardar informe ───────────────────────
const crear = async (req, res) => {
  const {
    nino_id, titulo, tipo, periodo, areas_evaluadas,
    logros, dificultades, recomendaciones, objetivos,
    observaciones, datos_progreso, visible_para_familia, borrador,
  } = req.body;

  // Verificar que el profesional tiene acceso al niño
  const relacion = await Relacion.findOne({
    where: { adulto_id: req.usuarioId, nino_id, activo: true },
  });
  if (!relacion && req.rol !== 'admin') {
    return res.status(403).json({ error: 'No tienes acceso a este paciente/estudiante' });
  }

  const informe = await Informe.create({
    nino_id, autor_id: req.usuarioId,
    titulo, tipo: tipo || 'progreso',
    periodo, areas_evaluadas: areas_evaluadas || [],
    logros, dificultades, recomendaciones, objetivos,
    observaciones, datos_progreso: datos_progreso || {},
    visible_para_familia: visible_para_familia !== false,
    borrador: borrador || false,
    fecha_informe: new Date(),
  });

  // Notificar a la familia si no es borrador
  if (!borrador && visible_para_familia !== false) {
    const nino = await Usuario.findByPk(nino_id, { attributes: ['nombre'] });
    const familiares = await Relacion.findAll({
      where: { nino_id, activo: true },
      include: [{ model: Usuario, as: 'adulto', where: { rol: 'padre' } }],
    });
    for (const rel of familiares) {
      await Notificacion.create({
        usuario_id: rel.adulto_id,
        tipo:    'informe',
        titulo:  `Nuevo informe de ${nino?.nombre || 'tu hijo/a'}`,
        mensaje: titulo,
        emoji:   '📋',
        color_fondo: '#E3F9F1',
        url: `/informes/${informe.id}`,
      });
      emitirNotificacion(rel.adulto_id, { tipo: 'informe', informe_id: informe.id });
    }
  }

  res.status(201).json({ mensaje: 'Informe guardado', informe });
};

// ── Actualizar informe ────────────────────────────
const actualizar = async (req, res) => {
  const informe = await Informe.findByPk(req.params.id);
  if (!informe) return res.status(404).json({ error: 'Informe no encontrado' });
  if (informe.autor_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  await informe.update(req.body);
  res.json({ mensaje: 'Informe actualizado', informe });
};

// ── Eliminar informe ──────────────────────────────
const eliminar = async (req, res) => {
  const informe = await Informe.findByPk(req.params.id);
  if (!informe) return res.status(404).json({ error: 'No encontrado' });
  if (informe.autor_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }
  // Eliminar PDF asociado
  if (informe.pdf_url) {
    const pdfPath = path.join(__dirname, '../../', informe.pdf_url);
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
  }
  await informe.destroy();
  res.json({ mensaje: 'Informe eliminado' });
};

// ── Generar y descargar PDF ───────────────────────
const descargarPDF = async (req, res) => {
  const { id } = req.params;

  const informe = await Informe.findByPk(id, {
    include: [
      { model: Usuario, as: 'nino',  attributes: ['nombre','apellido'] },
      { model: Usuario, as: 'autor', attributes: ['nombre','apellido','rol'] },
    ],
  });
  if (!informe) return res.status(404).json({ error: 'Informe no encontrado' });

  // Verificar acceso
  const esAutor   = informe.autor_id === req.usuarioId;
  const esAdmin   = req.rol === 'admin';
  const esFamilia = req.rol === 'padre' && informe.visible_para_familia;
  if (!esAutor && !esAdmin && !esFamilia) {
    return res.status(403).json({ error: 'Sin acceso a este informe' });
  }

  // Crear PDF en memoria
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="informe_${id}.pdf"`);
  doc.pipe(res);

  // ── Encabezado ──
  doc.rect(0, 0, doc.page.width, 80).fill('#4C7EF3');
  doc.fillColor('#FFFFFF')
     .font('Helvetica-Bold').fontSize(22)
     .text('ConectaTEA', 50, 20)
     .fontSize(12)
     .text('Plataforma Educativa Inclusiva para TEA', 50, 48);

  doc.fillColor('#1E2B4A').moveDown(3);

  // ── Tipo de informe ──
  const tipoLabel = {
    progreso: 'Informe de Progreso', seguimiento: 'Informe de Seguimiento',
    evaluacion_inicial: 'Evaluación Inicial', plan_trabajo: 'Plan de Trabajo',
    incidente: 'Informe de Incidente', observacion: 'Observación Clínica',
  }[informe.tipo] || informe.tipo;

  doc.font('Helvetica-Bold').fontSize(18).fillColor('#4C7EF3')
     .text(tipoLabel, { align: 'center' });
  doc.moveDown(0.5);

  // ── Datos del informe ──
  doc.font('Helvetica').fontSize(11).fillColor('#4A5568');
  const infoRows = [
    ['Estudiante/Paciente:', `${informe.nino?.nombre} ${informe.nino?.apellido}`],
    ['Elaborado por:',       `${informe.autor?.nombre} ${informe.autor?.apellido} (${informe.autor?.rol})`],
    ['Período evaluado:',    informe.periodo || 'No especificado'],
    ['Fecha del informe:',   new Date(informe.fecha_informe).toLocaleDateString('es-CO',{ day:'numeric', month:'long', year:'numeric' })],
    ['Áreas evaluadas:',     (informe.areas_evaluadas || []).join(', ') || 'General'],
  ];

  doc.rect(50, doc.y, doc.page.width - 100, 2).fill('#E2E8F0');
  doc.moveDown(0.5);

  for (const [label, value] of infoRows) {
    doc.font('Helvetica-Bold').fillColor('#1E2B4A').text(label, 50, doc.y, { continued: true, width: 180 });
    doc.font('Helvetica').fillColor('#4A5568').text(` ${value}`);
  }

  doc.moveDown();
  doc.rect(50, doc.y, doc.page.width - 100, 2).fill('#E2E8F0');
  doc.moveDown();

  // ── Secciones del informe ──
  const secciones = [
    { titulo: '📈 Logros y Avances', contenido: informe.logros, color: '#2ECC8E' },
    { titulo: '⚠️ Dificultades Observadas', contenido: informe.dificultades, color: '#FFB347' },
    { titulo: '💡 Recomendaciones para la Familia', contenido: informe.recomendaciones, color: '#4C7EF3' },
    { titulo: '🎯 Objetivos Próximo Período', contenido: informe.objetivos, color: '#8B5CF6' },
    { titulo: '📝 Observaciones Adicionales', contenido: informe.observaciones, color: '#14B8A6' },
  ];

  for (const sec of secciones) {
    if (!sec.contenido) continue;
    if (doc.y > doc.page.height - 150) doc.addPage();

    doc.font('Helvetica-Bold').fontSize(13).fillColor(sec.color)
       .text(sec.titulo);
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(11).fillColor('#4A5568')
       .text(sec.contenido, { align: 'justify', lineGap: 4 });
    doc.moveDown();
  }

  // ── Pie de página ──
  if (doc.y > doc.page.height - 100) doc.addPage();
  doc.moveDown(2);
  doc.rect(50, doc.y, doc.page.width - 100, 1).fill('#E2E8F0');
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(9).fillColor('#94A3B8')
     .text(`Generado por ConectaTEA — ${new Date().toLocaleString('es-CO')}`, { align: 'center' });
  doc.text('Este informe es confidencial y está destinado únicamente al receptor autorizado.', { align: 'center' });

  doc.end();
  logger.info(`PDF generado para informe ${id} por usuario ${req.usuarioId}`);
};

// ── Enviar informe a la familia ───────────────────
const enviarFamilia = async (req, res) => {
  const informe = await Informe.findByPk(req.params.id, {
    include: [{ model: Usuario, as: 'nino', attributes: ['nombre','id'] }],
  });
  if (!informe) return res.status(404).json({ error: 'No encontrado' });
  if (informe.autor_id !== req.usuarioId && req.rol !== 'admin') {
    return res.status(403).json({ error: 'Sin permiso' });
  }

  await informe.update({
    enviado_familia: true,
    visible_para_familia: true,
    fecha_envio: new Date(),
  });

  // Notificar a familiares
  const familiares = await Relacion.findAll({
    where: { nino_id: informe.nino_id, activo: true },
    include: [{ model: Usuario, as: 'adulto', where: { rol: 'padre' } }],
  });
  for (const rel of familiares) {
    await Notificacion.create({
      usuario_id: rel.adulto_id,
      tipo: 'informe',
      titulo: `Informe disponible: ${informe.nino?.nombre}`,
      mensaje: informe.titulo,
      emoji: '📋',
      color_fondo: '#E3F9F1',
    });
    emitirNotificacion(rel.adulto_id, { tipo: 'informe_nuevo', titulo: informe.titulo });
  }

  res.json({ mensaje: 'Informe enviado a la familia', informe });
};

module.exports = { listar, crear, actualizar, eliminar, descargarPDF, enviarFamilia };
