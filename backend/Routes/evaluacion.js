const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/evaluacion/guardar', async (req, res) => {
  console.log('🎯 EVALUACIÓN RECIBIDA:', JSON.stringify(req.body, null, 2));

  try {
    const { id_auditoria, detalles, porcentaje_final } = req.body;

    // 1. Validaciones de entrada
    if (!id_auditoria) {
      return res.status(400).json({ error: 'Falta id_auditoria' });
    }
    if (porcentaje_final === undefined || isNaN(porcentaje_final)) {
      return res.status(400).json({ error: 'Falta o es inválido porcentaje_final' });
    }
    if (!detalles || typeof detalles !== 'object' || Object.keys(detalles).length === 0) {
      return res.status(400).json({ error: 'Faltan detalles de las etapas' });
    }

    const id = Number(id_auditoria);

    // 2. Calcular puntos para la tabla maestra
    const puntosObtenidos = Object.values(detalles).reduce((sum, info) => {
      const score = Number(info?.score || 0);
      return sum + (isNaN(score) ? 0 : score);
    }, 0);
    const puntos_restados = Math.max(0, 25 - puntosObtenidos);

    // 3. Actualizar registro_auditoria_maestro
    await prisma.registro_auditoria_maestro.update({
      where: { id_auditoria: id },
      data: {
        porcentaje_final: Number(porcentaje_final),
        puntos_restados: puntos_restados,
      },
    });

    console.log('✅ MAESTRO ACTUALIZADO:', { id_auditoria: id, porcentaje_final });

    // 4. Guardar detalles en detalle_evaluacion_5s
    const operaciones = [];
    
    for (const [seccionStr, info] of Object.entries(detalles)) {
      const seccion = Number(seccionStr);

      if (isNaN(seccion)) continue;

      const score = Number(info?.score || 0);
      const comentario = info?.comment?.trim() || 'Sin observaciones';

      // Usamos los nombres exactos de tu Schema: seccion_id y puntuacion
      operaciones.push(
        prisma.detalle_evaluacion_5s.upsert({
          where: {
            id_auditoria_seccion: {
              id_auditoria: id,
              seccion_id: seccion
            }
          },
          update: {
            puntuacion: score,
            comentario: comentario,
            titulo: `Etapa ${seccion}`
          },
          create: {
            id_auditoria: id,
            seccion_id: seccion,
            titulo: `Etapa ${seccion}`,
            puntuacion: score,
            comentario: comentario
          }
        })
      );
    }

    // Ejecutar todas las actualizaciones de detalles
    await Promise.all(operaciones);

    console.log(`✅ ${operaciones.length} detalles procesados para auditoría ${id}`);

    res.json({ 
      success: true, 
      id_auditoria: id,
      porcentaje_final 
    });

  } catch (error) {
    console.error('💥 ERROR AL GUARDAR:', error);
    res.status(500).json({ 
      error: 'Error al guardar en base de datos',
      detalle: error.message 
    });
  }
});

module.exports = router;