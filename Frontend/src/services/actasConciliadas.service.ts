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
  
  // Información del conciliador
  conciliador_nombre?: string;
  conciliador_documento?: string;
  
  // Información del operario
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

  // PASO 1: Agrupar residuos por acta_id
  const actasAgrupadas = new Map<number, ConciliacionExtendida>();

  actasGeneracionResiduos.forEach((agr) => {
    const gen = generacionesMap.get(agr.generacion_residuo_id);
    if (!gen) return;

    const res = residuosMap.get(gen.residuo_id);
    const acta = actasMap.get(agr.acta_id);
    if (!acta) return;

    // Crear el residuo actual
    const residuo: ResiduoActa = {
      acta_generacion_residuo_id: agr.id,
      residuo_nombre: res?.nombre ?? "Sin nombre",
      motivo: gen.motivo,
      descripcion_residuo_otro:
        res?.nombre === "Otro" ? gen.residuo_otro ?? undefined : undefined,
      descripcion_motivo_otro:
        gen.motivo === "Otro" ? gen.motivo_otro ?? undefined : undefined,
      peso_reportado: agr.peso_reportado?.toString() ?? "0",
      peso_conciliado: agr.peso_conciliado?.toString() ?? undefined,
    };

    // Verificar si ya existe esta acta en el mapa
    if (actasAgrupadas.has(agr.acta_id)) {
      // Ya existe: agregar residuo al array existente
      const actaExistente = actasAgrupadas.get(agr.acta_id)!;
      actaExistente.residuos.push(residuo);
      
      // Actualizar el tipo si algún residuo tiene novedad
      const novedad = novedadesMap.get(agr.id)?.[0]?.descripcion;
      if (novedad && actaExistente.tipo !== "con_novedad") {
        actaExistente.tipo = "con_novedad";
        actaExistente.novedad = novedad;
      }
    } else {
      // No existe: crear nueva acta con este residuo
      const subarea = subAreasMap.get(acta.subarea_id ?? -1);
      const centroCosto = centrosMap.get(acta.centro_costo_id ?? -1);

      const operario = operarios.find(
        (o) => o.documento === acta.documento_entrega
      );

      const conciliador = operarios.find(
        (o) => o.documento === acta.documento_recepcion
      );

      const novedad = novedadesMap.get(agr.id)?.[0]?.descripcion ?? undefined;

      let tipo: "pendiente" | "conciliada" | "con_novedad" = "pendiente";
      if (novedad) tipo = "con_novedad";
      else if (agr.peso_conciliado != null) tipo = "conciliada";

      actasAgrupadas.set(agr.acta_id, {
        id: agr.id,
        acta_id: agr.acta_id,
        numero_acta: acta.numero_acta ?? "Sin número",
        fecha_acta: acta.fecha_acta ?? "",
        tipo,
        fecha_conciliacion: acta.fecha_conciliacion ?? undefined,
        
        operario_nombre: operario
          ? `${operario.nombre} ${operario.apellido ?? ""}`.trim()
          : undefined,
        operario_documento: operario?.documento ?? acta.documento_entrega,
        
        conciliador_nombre: conciliador
          ? `${conciliador.nombre} ${conciliador.apellido ?? ""}`.trim()
          : undefined,
        conciliador_documento: conciliador?.documento ?? undefined,
        
        residuos: [residuo], // Primer residuo
        novedad,

        consecutivo: acta.consecutivo,
        numero_inventario: acta.numero_inventario,

        subarea_id: acta.subarea_id,
        subarea_nombre: subarea?.nombre ?? "Sin subárea",

        centro_costo_id: acta.centro_costo_id,
        centro_costo_codigo: centroCosto?.codigo ?? undefined,
        centro_costo_nombre: centroCosto?.nombre ?? "",
      });
    }
  });

  // PASO 2: Convertir el Map a array
  return Array.from(actasAgrupadas.values());
}