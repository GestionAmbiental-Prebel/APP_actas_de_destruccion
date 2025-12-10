import { apiRequest } from "./api.service";
import {
  obtenerResiduosEspecificos,
  obtenerCategoriasResiduos,
  obtenerCentrosCosto,
  obtenerSubAreas,
} from "./catalogo.service";
import { obtenerOperarios } from "./operarios.service";

// ---------------- TIPOS ----------------

export type ResiduoActa = {
  acta_generacion_residuo_id: number; 
  residuo_nombre: string;
  motivo: string;
  descripcion_residuo_otro?: string;
  descripcion_motivo_otro?: string;
  peso_reportado: string;
  peso_conciliado?: string;
  

};

export type ConciliacionExtendida = {
  id: number;
  acta_id: number;
  numero_acta: string;
  fecha_acta: string;
  tipo: "pendiente" | "conciliada" | "con_novedad";
  fecha_conciliacion?: string;
  
  // 🆕 Información del conciliador
  conciliador_nombre?: string;
  conciliador_documento?: string;
  
  // 🆕 Información del operario
  operario_nombre?: string;
  operario_documento?: string;
  
  residuos: ResiduoActa[];
  novedad?: string;

  // Datos extendidos del acta / generación
  consecutivo?: string;
  numero_inventario?: string;

  subarea_id?: number;
  subarea_nombre?: string;

  centro_costo_id?: number;
  centro_costo_codigo?: string;
  centro_costo_nombre?: string;
};

// ===== FUNCIONES INTERNAS =====

async function obtenerActasGeneracionResiduos() {
  return apiRequest<any[]>("/actas-generacion-residuo/", { method: "GET" });
}

async function obtenerGeneraciones() {
  return apiRequest<any[]>("/generacion-residuo/", { method: "GET" });
}

async function obtenerActas() {
  return apiRequest<any[]>("/actas/", { method: "GET" });
}

async function obtenerNovedadesConciliacion() {
  return apiRequest<any[]>("/novedad-conciliacion/", { method: "GET" });
}

// ===== SERVICE FINAL =====

export async function obtenerActasConciliadas(): Promise<ConciliacionExtendida[]> {
  const [
    actasGeneracionResiduos,
    generaciones,
    actas,
    residuosEspecificos,
    categorias,
    centrosCosto,
    subAreas,
    operarios,
    novedades,
  ] = await Promise.all([
    obtenerActasGeneracionResiduos(),
    obtenerGeneraciones(),
    obtenerActas(),
    obtenerResiduosEspecificos(),
    obtenerCategoriasResiduos(),
    obtenerCentrosCosto(),
    obtenerSubAreas(),
    obtenerOperarios(),
    obtenerNovedadesConciliacion(),
  ]);

  const generacionesMap = new Map(generaciones.map((g) => [g.id, g]));
  const residuosMap = new Map(residuosEspecificos.map((r) => [r.id, r]));
  const actasMap = new Map(actas.map((a) => [a.id, a]));
  const centrosMap = new Map(centrosCosto.map((c) => [c.id, c]));
  const subAreasMap = new Map(subAreas.map((s) => [s.id, s]));

  const novedadesMap = new Map<number, any[]>();
  novedades.forEach((n) => {
    const relId = n.acta_generacion_residuo_id;
    if (!novedadesMap.has(relId)) novedadesMap.set(relId, []);
    novedadesMap.get(relId)?.push(n);
  });

  return actasGeneracionResiduos
    .map((agr) => {
      const gen = generacionesMap.get(agr.generacion_residuo_id);
      if (!gen) return null;

      const res = residuosMap.get(gen.residuo_id);
      const acta = actasMap.get(agr.acta_id);
      if (!acta) return null;

      // Subárea y centro de costo del acta
      const subarea = subAreasMap.get(acta.subarea_id ?? -1);
      const centroCosto = centrosMap.get(acta.centro_costo_id ?? -1);

      // 🆕 OPERARIO - El que entregó (documento_entrega)
      const operario = operarios.find(
        (o) => o.documento === acta.documento_entrega
      );

      // CONCILIADOR - El que recibió (documento_recepcion)
      const conciliador = operarios.find(
        (o) => o.documento === acta.documento_recepcion
      );

      const novedad = novedadesMap.get(agr.id)?.[0]?.descripcion ?? undefined;

      let tipo: "pendiente" | "conciliada" | "con_novedad" = "pendiente";
      if (novedad) tipo = "con_novedad";
      else if (agr.peso_conciliado != null) tipo = "conciliada";

      const residuos: ResiduoActa[] = [
  {
    acta_generacion_residuo_id: agr.id, // ← AQUI SE AGREGA
    residuo_nombre: res?.nombre ?? "Sin nombre",
    motivo: gen.motivo,
    descripcion_residuo_otro:
      res?.nombre === "Otro" ? gen.residuo_otro ?? undefined : undefined,
    descripcion_motivo_otro:
      gen.motivo === "Otro" ? gen.motivo_otro ?? undefined : undefined,
    peso_reportado: agr.peso_reportado?.toString() ?? "0",
    peso_conciliado: agr.peso_conciliado?.toString() ?? undefined,
  },
];

      return {
        id: agr.id,
        acta_id: agr.acta_id,
        numero_acta: acta.numero_acta ?? "Sin número",
        fecha_acta: acta.fecha_acta ?? "",
        tipo,
        fecha_conciliacion: acta.fecha_conciliacion ?? undefined,
        
        // 🆕 Información del OPERARIO
        operario_nombre: operario
          ? `${operario.nombre} ${operario.apellido ?? ""}`.trim()
          : undefined,
        operario_documento: operario?.documento ?? acta.documento_entrega,
        
        // Información del CONCILIADOR
        conciliador_nombre: conciliador
          ? `${conciliador.nombre} ${conciliador.apellido ?? ""}`.trim()
          : undefined,
        conciliador_documento: conciliador?.documento,
        
        residuos,
        novedad,

        consecutivo: acta.consecutivo,
        numero_inventario: acta.numero_inventario,

        subarea_id: acta.subarea_id,
        subarea_nombre: subarea?.nombre ?? "Sin subárea",

        centro_costo_id: acta.centro_costo_id,
        centro_costo_codigo: centroCosto?.codigo ?? null,
        centro_costo_nombre: centroCosto?.nombre ?? "",
      
      };
    })
    .filter((c) => c !== null) as ConciliacionExtendida[];
}