// backend/Routes/historial.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/auditorias-5s', async (req, res) => {
  try {
    const auditorias = await prisma.registro_auditoria_maestro.findMany({
      orderBy: { fecha_inspeccion: 'desc' },
      select: {
        id_auditoria: true,
        id_area: true,
        id_auditor: true,
        nombre_representante: true,
        fecha_inspeccion: true,
        foto_evidencia_general: true,
        porcentaje_final: true,
        puntos_restados: true,
        area: {
          select: { nombre_galera: true },
        },
        auditor: {
          select: { nombre_completo: true },
        },
        // 🚀 ¡ESTO ES LO QUE FALTABA! 🚀
        detalle_evaluacion_5s: {
          select: {
            seccion_id: true,
            puntuacion: true,
            comentario: true
          }
        }
      },
    });

    res.json(auditorias);
  } catch (error) {
    console.error('Error obteniendo auditorías 5S:', error);
    res.status(500).json({ error: 'Error al cargar auditorías 5S' });
  }
});

module.exports = router;