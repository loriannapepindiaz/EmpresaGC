-- CreateTable
CREATE TABLE "catalogo_areas" (
    "id_area" SERIAL NOT NULL,
    "nombre_galera" VARCHAR(100) NOT NULL,

    CONSTRAINT "catalogo_areas_pkey" PRIMARY KEY ("id_area")
);

-- CreateTable
CREATE TABLE "catalogo_auditores" (
    "id_auditor" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(100) NOT NULL,

    CONSTRAINT "catalogo_auditores_pkey" PRIMARY KEY ("id_auditor")
);

-- CreateTable
CREATE TABLE "registro_auditoria_maestro" (
    "id_auditoria" SERIAL NOT NULL,
    "id_area" INTEGER NOT NULL,
    "id_auditor" INTEGER NOT NULL,
    "nombre_representante" VARCHAR(100),
    "fecha_inspeccion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "foto_evidencia_general" TEXT,
    "porcentaje_final" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "registro_auditoria_maestro_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "detalle_evaluacion_5s" (
    "id_detalle" SERIAL NOT NULL,
    "id_auditoria" INTEGER NOT NULL,
    "etapa_nombre" VARCHAR(50) NOT NULL,
    "puntaje_obtenido" INTEGER NOT NULL,
    "comentario_observacion" TEXT,

    CONSTRAINT "detalle_evaluacion_5s_pkey" PRIMARY KEY ("id_detalle")
);

-- AddForeignKey
ALTER TABLE "registro_auditoria_maestro" ADD CONSTRAINT "registro_auditoria_maestro_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "catalogo_areas"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_auditoria_maestro" ADD CONSTRAINT "registro_auditoria_maestro_id_auditor_fkey" FOREIGN KEY ("id_auditor") REFERENCES "catalogo_auditores"("id_auditor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_evaluacion_5s" ADD CONSTRAINT "detalle_evaluacion_5s_id_auditoria_fkey" FOREIGN KEY ("id_auditoria") REFERENCES "registro_auditoria_maestro"("id_auditoria") ON DELETE RESTRICT ON UPDATE CASCADE;
