const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/evaluacion/guardar', async (req, res) => {
  console.log('🎯 EVALUACIÓN RECIBIDA:', req.body);
  
  try {
    const { id_auditoria, detalles, porcentaje_final } = req.body;

    if (!id_auditoria || porcentaje_final === undefined) {
      return res.status(400).json({ error: 'Faltan id_auditoria o porcentaje_final' });
    }

    const id = Number(id_auditoria);

    // Calcular puntos restados desde los detalles (25 máximo - suma scores)
    const secciones = Object.entries(detalles || {});
    const puntosObtenidos = secciones.reduce((sum, [, info]) => 
      sum + Number(info.score || 0), 0
    );
    const puntos_restados = Math.max(0, 25 - puntosObtenidos);

    // SOLO ACTUALIZAR la tabla MAESTRA (sin tocar detalles)
    await prisma.registro_auditoria_maestro.update({
      where: { id_auditoria: id },
      data: {
        porcentaje_final: Number(porcentaje_final),
        puntos_restados,
      },
    });

    console.log('✅ MAESTRO ACTUALIZADO:', { id_auditoria: id, porcentaje_final, puntos_restados });
    res.json({ success: true, id_auditoria: id, puntos_restados });
    
  } catch (error) {
    console.error('💥 ERROR EVALUACIÓN:', error);
    res.status(500).json({ error: 'Error al guardar evaluación' });
  }
});

module.exports = router;
