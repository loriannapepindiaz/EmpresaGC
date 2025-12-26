// backend/Routes/pantalla2.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET: Obtener áreas para el selector
router.get('/areas', async (req, res) => {
  try {
    const areas = await prisma.catalogo_areas.findMany();
    res.json(areas);
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    res.status(500).json({ error: "Error al obtener áreas" });
  }
});

// 2. GET: Obtener auditores
router.get('/auditores', async (req, res) => {
  try {
    const auditores = await prisma.catalogo_auditores.findMany();
    res.json(auditores);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener auditores" });
  }
});

// 3. POST: Iniciar Auditoría (Guardar en Maestro)
router.post('/iniciar', async (req, res) => {
  try {
    let { id_area, nombre_representante, nombre_auditor } = req.body;

    // --- PASO 1: Asegurar Auditor ---
    let auditor = await prisma.catalogo_auditores.findFirst({
      where: { nombre_completo: nombre_auditor }
    });

    if (!auditor) {
      auditor = await prisma.catalogo_auditores.create({
        data: { nombre_completo: nombre_auditor }
      });
    }

    // --- PASO 2: Asegurar Área ---
    let finalAreaId;

    if (id_area && !isNaN(id_area)) {
      finalAreaId = parseInt(id_area);
    } else {
      const nombreBuscar =
        typeof id_area === 'string' && id_area.length > 0
          ? id_area
          : 'Área General';

      let areaBD = await prisma.catalogo_areas.findFirst({
        where: { nombre_galera: nombreBuscar }
      });

      if (!areaBD) {
        areaBD = await prisma.catalogo_areas.create({
          data: { nombre_galera: nombreBuscar }
        });
      }
      finalAreaId = areaBD.id_area;
    }

    // --- PASO 3: Crear el registro Maestro ---
    const nuevaAuditoria = await prisma.registro_auditoria_maestro.create({
      data: {
        nombre_representante: nombre_representante || 'No especificado',
        porcentaje_final: 0,
        puntos_restados: 0,                   // ← importante
        area: {
          connect: { id_area: finalAreaId }
        },
        auditor: {
          connect: { id_auditor: auditor.id_auditor }
        }
      }
    });

    res.json({
      success: true,
      id_auditoria: nuevaAuditoria.id_auditoria
    });
  } catch (error) {
    console.error('ERROR AL INICIAR AUDITORÍA:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno en el servidor',
      detalle: error.message
    });
  }
});

// Actualizar la foto en el registro maestro
router.put('/actualizar-foto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreFoto } = req.body;

    const auditoriaActualizada =
      await prisma.registro_auditoria_maestro.update({
        where: { id_auditoria: parseInt(id) },
        data: {
          foto_evidencia_general: nombreFoto
        }
      });

    res.json({ success: true, data: auditoriaActualizada });
  } catch (error) {
    console.error('Error al actualizar foto:', error);
    res.status(500).json({ error: 'No se pudo vincular la foto' });
  }
});

module.exports = router;
