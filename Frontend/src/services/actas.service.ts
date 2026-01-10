import { apiRequest } from './api.service';
import { obtenerOperarios } from './operarios.service';
import { 
  obtenerSubAreas, 
  obtenerCentrosCosto, 
  obtenerResiduosEspecificos,
  obtenerCategoriasResiduos
} from './catalogo.service';

// ===== TIPOS =====

type GeneracionResiduoPayload = {
  fecha: string;
  peso: string;
  residuo_id: number;
  operario_id: number;
  motivo: string;
  motivo_otro?: string | null;
  residuo_otro?: string | null;
};

type ActaPayload = {
  fecha_acta: string;
  subarea_id: number;
  centro_costo_id: number;
  documento_entrega: string;
  documento_recepcion: string;
  consecutivo?: number | null;
  numero_inventario?: number | null;
};

type ActaGeneracionResiduoPayload = {
  acta_id: number;
  generacion_residuo_id: number;
  peso_reportado: string;
  peso_conciliado?: string | null;
};

type CrearActaCompleta = {
  cedula: string;
  nombre: string;
  apellido: string;
  operario_id: number;  
  subarea_id: number;
  centro_costo_id: number;
  consecutivo?: string;
  numero_inventario?: string;
  residuos: Array<{
    residuo_id: number;
    peso: string;
    motivo: string;
    motivo_otro?: string | null;
    residuo_otro?: string | null;
  }>;
};

// ===== FUNCIONES =====

async function crearGeneracionResiduo(data: GeneracionResiduoPayload) {
  return apiRequest<{ id: number }>('/generacion-residuo/', {
    method: 'POST',
    body: data,
  });
}

async function crearActa(data: ActaPayload) {
  return apiRequest<{ id: number; numero_acta: string }>('/actas/', {
    method: 'POST',
    body: data,
  });
}

async function crearActaGeneracionResiduo(data: ActaGeneracionResiduoPayload) {
  return apiRequest<{ id: number }>('/actas-generacion-residuo/', {
    method: 'POST',
    body: data,
  });
}

// ===== Crear acta completa =====

async function crearActaCompleta(datos: CrearActaCompleta) {
  try {
    const fechaActual = new Date().toISOString();

    const generacionResiduosIds: number[] = [];

    for (const residuo of datos.residuos) {
      const generacionResiduo = await crearGeneracionResiduo({
        fecha: fechaActual,
        peso: residuo.peso,
        residuo_id: residuo.residuo_id,
        operario_id: datos.operario_id,
        motivo: residuo.motivo,
        motivo_otro: residuo.motivo === 'Otro' ? (residuo.motivo_otro ?? null) : null,
        residuo_otro: residuo.residuo_otro ?? null,
      });

      generacionResiduosIds.push(generacionResiduo.id);
    }

    const actaPayload: ActaPayload = {
      fecha_acta: fechaActual,
      subarea_id: datos.subarea_id,
      centro_costo_id: datos.centro_costo_id,
      documento_entrega: datos.cedula,
      documento_recepcion: '',
    };

    if (datos.consecutivo && datos.consecutivo.trim() !== '') {
      const consecutivoNum = parseInt(datos.consecutivo, 10);
      if (!isNaN(consecutivoNum)) {
        actaPayload.consecutivo = consecutivoNum;
      }
    }

    if (datos.numero_inventario && datos.numero_inventario.trim() !== '') {
      const inventarioNum = parseInt(datos.numero_inventario, 10);
      if (!isNaN(inventarioNum)) {
        actaPayload.numero_inventario = inventarioNum;
      }
    }

    const acta = await crearActa(actaPayload);

    for (let i = 0; i < generacionResiduosIds.length; i++) {
      await crearActaGeneracionResiduo({
        acta_id: acta.id,
        generacion_residuo_id: generacionResiduosIds[i],
        peso_reportado: datos.residuos[i].peso,
      });
    }

    return {
      success: true,
      numeroActa: acta.numero_acta,
      actaId: acta.id,
    };

  } catch (error) {
    console.error('Error al crear acta completa:', error);
    throw error;
  }
}

// ===== Obtener actas =====

async function obtenerActas() {
  return apiRequest<any[]>('/actas/', { method: 'GET' });
}

// ===== 🔥 FUNCIÓN CORREGIDA - Incluye campos de novedad completos =====
async function obtenerActasCompletas() {
  const [
    actas,
    operarios,
    residuosEspecificos,
    categorias,
    subareas,
    centrosCosto,
    novedades
  ] = await Promise.all([
    obtenerActas(),
    obtenerOperarios(),
    obtenerResiduosEspecificos(),
    obtenerCategoriasResiduos(),
    obtenerSubAreas(),        
    obtenerCentrosCosto(),
    apiRequest<any[]>('/novedad-conciliacion/', { method: 'GET' })
  ]);

  const actasGeneracionResiduos = await apiRequest<any[]>('/actas-generacion-residuo/');
  const generaciones = await apiRequest<any[]>('/generacion-residuo/');

  // Crear mapa de novedades por acta_generacion_residuo_id
  const novedadesMap = new Map<number, any[]>();
  novedades.forEach((n) => {
    const relId = n.acta_generacion_residuo_id;
    if (!novedadesMap.has(relId)) novedadesMap.set(relId, []);
    novedadesMap.get(relId)?.push(n);
  });

  return actas.map((acta: any) => {
    const operario = operarios.find((o: any) => o.documento === acta.documento_entrega);
    const subarea = subareas.find((s: any) => s.id === acta.subarea_id);
    const centroCosto = centrosCosto.find((cc: any) => cc.id === acta.centro_costo_id);
    const relaciones = actasGeneracionResiduos.filter((rel: any) => rel.acta_id === acta.id);

    // Variables para calcular estado de conciliación
    let tieneConciliacion = false;
    let tieneNovedad = false;
    let todasConciliadas = true;

    const residuos = relaciones
      .map((rel: any) => {
        const gen = generaciones.find((g: any) => g.id === rel.generacion_residuo_id);
        if (!gen) return null;

        const resEsp = residuosEspecificos.find((r: any) => r.id === gen.residuo_id);
        const cat = categorias.find((c: any) => c.id === resEsp?.categoria_id);

        // 🆕 EXTRAER INFORMACIÓN DE NOVEDAD
        const novedadResiduo = novedadesMap.get(rel.id)?.[0];
        let tieneNovedadResiduo = false;
        let descripcionNovedad = '';
        let tipoNovedad = '';

        if (novedadResiduo && novedadResiduo.descripcion) {
          tieneNovedadResiduo = true;
          tieneNovedad = true; // Para el acta
          descripcionNovedad = novedadResiduo.descripcion;

          // 🔥 EXTRAER TIPO DE NOVEDAD DE LA DESCRIPCIÓN
          if (descripcionNovedad.startsWith('Diferencia de peso')) {
            tipoNovedad = 'diferencia_peso';
          } else if (descripcionNovedad.startsWith('Diferencia nombre material')) {
            tipoNovedad = 'diferencia_material';
          } else if (descripcionNovedad.startsWith('Otro')) {
            tipoNovedad = 'otro';
          }
        }

        // Verificar estado de conciliación
        if (rel.peso_conciliado != null) {
          tieneConciliacion = true;
        } else {
          todasConciliadas = false;
        }

        return {
          acta_generacion_residuo_id: rel.id,
          residuo_id: gen.residuo_id,
          residuo_nombre: resEsp?.nombre ?? "Sin nombre",
          categoria_nombre: cat?.nombre ?? "Sin categoría",
          categoria_id: cat?.id ?? null, // 🆕 Agregado para el modal
          motivo: gen.motivo,
          motivo_otro: gen.motivo_otro ?? null,
          residuo_otro: gen.residuo_otro ?? null,
          peso_reportado: rel.peso_reportado,
          peso_conciliado: rel.peso_conciliado ?? rel.peso_reportado, // 🆕 Inicializar con reportado
          fecha: gen.fecha,
          
          // 🆕🆕🆕 CAMPOS CRÍTICOS PARA EL MODAL
          tiene_novedad: tieneNovedadResiduo,
          descripcion_novedad: descripcionNovedad,
          tipo_novedad: tipoNovedad,
          
          // 🆕 Campos adicionales para edición
          descripcion_residuo_otro: gen.residuo_otro ?? '',
          descripcion_motivo_otro: gen.motivo_otro ?? '',
          
          // Campo legacy para compatibilidad
          novedad: novedadResiduo?.descripcion ?? null,
        };
      })
      .filter((r: any) => r !== null);

    // Determinar estado del acta
    let estadoConciliacion: 'sin_conciliar' | 'conciliada' | 'con_novedad' | 'parcial' = 'sin_conciliar';
    
    if (tieneNovedad) {
      estadoConciliacion = 'con_novedad';
    } else if (tieneConciliacion) {
      estadoConciliacion = todasConciliadas ? 'conciliada' : 'parcial';
    }

    return {
      ...acta,

      operario_nombre: operario
        ? `${operario.nombre} ${operario.apellido ?? ""}`.trim()
        : "Desconocido",

      operario_documento: operario?.documento ?? acta.documento_entrega,

      subarea: subarea?.nombre ?? "Sin subárea",
      subarea_id: acta.subarea_id,
      subarea_nombre: subarea?.nombre ?? "Sin subárea", // 🆕 Para el modal
      
      centro_costo: centroCosto?.nombre ?? "Sin centro de costo",
      centro_costo_codigo: centroCosto?.codigo ?? null,
      centro_costo_id: acta.centro_costo_id,
      centro_costo_nombre: centroCosto?.nombre ?? "Sin centro de costo", // 🆕 Para el modal

      documento_recepcion: acta.documento_recepcion,
      conciliador_documento: acta.documento_recepcion, // 🆕 Para el modal
      consecutivo: acta.consecutivo ?? null,
      numero_inventario: acta.numero_inventario ?? null,

      residuos,
      
      // Información de conciliación
      estado_conciliacion: estadoConciliacion,
      tiene_novedad: tieneNovedad,
      tiene_conciliacion: tieneConciliacion,
    };
  });
}

async function obtenerActasConciliadas() {
  const [actas, operarios, residuosEspecificos, categorias, novedades] = await Promise.all([
    obtenerActas(),
    obtenerOperarios(),
    obtenerResiduosEspecificos(),
    obtenerCategoriasResiduos(),
    apiRequest<any[]>('/novedad-conciliacion/', { method: 'GET' }) // 🆕 Agregado
  ]);

  const actasGeneracionResiduos = await apiRequest<any[]>('/actas-generacion-residuo/');
  const generaciones = await apiRequest<any[]>('/generacion-residuo/');

  // 🆕 Crear mapa de novedades
  const novedadesMap = new Map<number, any[]>();
  novedades.forEach((n) => {
    const relId = n.acta_generacion_residuo_id;
    if (!novedadesMap.has(relId)) novedadesMap.set(relId, []);
    novedadesMap.get(relId)?.push(n);
  });

  return actas
    .map((acta: any) => {
      const operario = operarios.find((o) => o.documento === acta.documento_entrega);
      const relaciones = actasGeneracionResiduos.filter(rel => rel.acta_id === acta.id);

      const residuos = relaciones.map(rel => {
        const gen = generaciones.find(g => g.id === rel.generacion_residuo_id);
        if (!gen) return null;

        const resEsp = residuosEspecificos.find(r => r.id === gen.residuo_id);
        const cat = categorias.find(c => c.id === resEsp?.categoria_id);

        // 🆕 EXTRAER INFORMACIÓN DE NOVEDAD
        const novedadResiduo = novedadesMap.get(rel.id)?.[0];
        let tieneNovedadResiduo = false;
        let descripcionNovedad = '';
        let tipoNovedad = '';

        if (novedadResiduo && novedadResiduo.descripcion) {
          tieneNovedadResiduo = true;
          descripcionNovedad = novedadResiduo.descripcion;

          // Extraer tipo de novedad
          if (descripcionNovedad.startsWith('Diferencia de peso')) {
            tipoNovedad = 'diferencia_peso';
          } else if (descripcionNovedad.startsWith('Diferencia nombre material')) {
            tipoNovedad = 'diferencia_material';
          } else if (descripcionNovedad.startsWith('Otro')) {
            tipoNovedad = 'otro';
          }
        }

        return {
          acta_generacion_residuo_id: rel.id,
          residuo_id: gen.residuo_id,
          residuo_nombre: resEsp?.nombre ?? 'Sin nombre',
          categoria_nombre: cat?.nombre ?? 'Sin categoría',
          categoria_id: cat?.id ?? null, // 🆕
          motivo: gen.motivo,
          motivo_otro: gen.motivo_otro ?? null,
          residuo_otro: gen.residuo_otro ?? null, // 🆕
          peso_reportado: rel.peso_reportado,
          peso_conciliado: rel.peso_conciliado ?? null,
          fecha: gen.fecha,
          
          // 🆕 Campos de novedad
          tiene_novedad: tieneNovedadResiduo,
          descripcion_novedad: descripcionNovedad,
          tipo_novedad: tipoNovedad,
          
          // 🆕 Campos adicionales
          descripcion_residuo_otro: gen.residuo_otro ?? '',
          descripcion_motivo_otro: gen.motivo_otro ?? '',
        };
      }).filter((r): r is NonNullable<typeof r> => r !== null);

      if (residuos.some(r => r.peso_conciliado != null)) {
        const peso_total_reportado = residuos.reduce((sum, r) => sum + parseFloat(r.peso_reportado), 0);
        const peso_total_conciliado = residuos.reduce((sum, r) => sum + parseFloat(r.peso_conciliado ?? '0'), 0);

        return {
          ...acta,
          operario_nombre: operario ? `${operario.nombre} ${operario.apellido ?? ''}`.trim() : 'Desconocido',
          operario_documento: operario?.documento ?? acta.documento_entrega,
          consecutivo: acta.consecutivo ?? null,
          numero_inventario: acta.numero_inventario ?? null,
          residuos,
          peso_total_reportado,
          peso_total_conciliado,
          
          // 🆕 Información de novedades
          tiene_novedad: residuos.some(r => r.tiene_novedad),
        };
      }

      return null;
    })
    .filter((acta): acta is NonNullable<typeof acta> => acta !== null);
}

export { 
  crearActaCompleta, 
  obtenerActas, 
  obtenerActasCompletas, 
  obtenerActasConciliadas,
};