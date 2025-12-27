const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/evaluacion/guardar', async (req, res) => {
  // Log inicial para ver qué llega desde el celular/navegador
  console.log('🎯 RECIBIENDO EVALUACIÓN:', JSON.stringify(req.body, null, 2));

  try {
    const { id_auditoria, detalles, porcentaje_final } = req.body;

    // 1. Validaciones básicas
    if (!id_auditoria) return res.status(400).json({ error: 'Falta id_auditoria' });
    if (!detalles) return res.status(400).json({ error: 'Faltan detalles' });

    const id = Number(id_auditoria);

    // 2. Calcular puntos restados
    const puntosObtenidos = Object.values(detalles).reduce((sum, info) => {
      return sum + (Number(info?.score) || 0);
    }, 0);
    const puntos_restados = Math.max(0, 25 - puntosObtenidos);

    // 3. ACTUALIZAR MAESTRO
    console.log(`⏳ Actualizando Maestro ID: ${id}...`);
    await prisma.registro_auditoria_maestro.update({
      where: { id_auditoria: id },
      data: {
        porcentaje_final: Number(porcentaje_final),
        puntos_restados: puntos_restados,
      },
    });
    console.log('✅ MAESTRO OK');

    // 4. PREPARAR Y GUARDAR DETALLES
    const entradas = Object.entries(detalles);
    console.log(`📦 Procesando ${entradas.length} etapas para guardar...`);

    // Usamos un bucle for-of con await para mayor seguridad en el debug
    for (const [seccionStr, info] of entradas) {
      const seccion = Number(seccionStr);
      const score = Number(info?.score || 0);
      const comentario = info?.comment?.trim() || 'Sin observaciones';

      console.log(`  -> Guardando Etapa ${seccion}: Score ${score}`);

      await prisma.detalle_evaluacion_5s.upsert({
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
      });
    }

    console.log(`✨ PROCESO COMPLETADO EXITOSAMENTE`);

    res.json({ 
      success: true, 
      id_auditoria: id,
      puntos_guardados: entradas.length 
    });

  } catch (error) {
    console.error('💥 ERROR CRÍTICO EN BACKEND:', error);
    res.status(500).json({ 
      error: 'Error interno al guardar',
      codigo: error.code, // Útil para saber si es error de Prisma
      mensaje: error.message 
    });
  }
});

module.exports = router;