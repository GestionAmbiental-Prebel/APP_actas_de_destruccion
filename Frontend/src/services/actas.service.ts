import { apiRequest } from './api.service';
import { obtenerOperarios } from './operarios.service';
import { 
  obtenerResiduosEspecificos, 
  obtenerCategoriasResiduos 
} from './catalogo.service';

// ===== TIPOS =====

type GeneracionResiduoPayload = {
  fecha: string;
  peso: string; // siempre string
  residuo_id: number;
  operario_id: number;
  motivo: string;
  motivo_otro?: string | null;
  residuo_otro?: string | null;
};

type ActaPayload = {
  numero_acta: string;
  fecha_acta: string;
  subarea_id: number;
  centro_costo_id: number;
  documento_entrega: string;
  documento_recepcion: string;
  consecutivo?: string | null; // string | null
  numero_inventario?: string | null; // string | null
};

type ActaGeneracionResiduoPayload = {
  acta_id: number;
  generacion_residuo_id: number;
  peso_reportado: string; // string
  peso_conciliado?: string | null;
};

type CrearActaCompleta = {
  cedula: string;
  nombre: string;
  apellido: string;
  operario_id: number;  
  subarea_id: number;
  centro_costo_id: number;
  consecutivo?: string | null;
  numero_inventario?: string | null;
  residuos: Array<{
    residuo_id: number;
    peso: string;
    motivo: string;
    motivo_otro?: string | null;
    residuo_otro?: string | null;
    consecutivo?: string | null;        
    numero_inventario?: string | null;  
  }>;
};

// ===== FUNCIONES =====

function generarNumeroActa(): string {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const timestamp = Date.now();
  return `ACT-${year}-${timestamp}`;
}

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
    const numeroActa = generarNumeroActa();

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

    const acta = await crearActa({
      numero_acta: numeroActa,
      fecha_acta: fechaActual,
      subarea_id: datos.subarea_id,
      centro_costo_id: datos.centro_costo_id,
      documento_entrega: datos.cedula,
      documento_recepcion: '',
      consecutivo: datos.consecutivo != null ? String(datos.consecutivo) : null,
      numero_inventario: datos.numero_inventario != null ? String(datos.numero_inventario) : null,

    });

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

async function obtenerActasCompletas() {
  const [actas, operarios, residuosEspecificos, categorias] = await Promise.all([
    obtenerActas(),
    obtenerOperarios(),
    obtenerResiduosEspecificos(),
    obtenerCategoriasResiduos(),
  ]);

  const actasGeneracionResiduos = await apiRequest<any[]>('/actas-generacion-residuo/');
  const generaciones = await apiRequest<any[]>('/generacion-residuo/');

  return actas.map((acta: any) => {
    const operario = operarios.find((o) => o.documento === acta.documento_entrega);
    const relaciones = actasGeneracionResiduos.filter(rel => rel.acta_id === acta.id);

    const residuos = relaciones.map(rel => {
      const gen = generaciones.find(g => g.id === rel.generacion_residuo_id);
      if (!gen) return null;

      const resEsp = residuosEspecificos.find(r => r.id === gen.residuo_id);
      const cat = categorias.find(c => c.id === resEsp?.categoria_id);

      return {
        acta_generacion_residuo_id: rel.id,
        residuo_id: gen.residuo_id,
        residuo_nombre: resEsp?.nombre ?? 'Sin nombre',
        categoria_nombre: cat?.nombre ?? 'Sin categoría',
        motivo: gen.motivo,
        motivo_otro: gen.motivo_otro ?? null,
        peso_reportado: rel.peso_reportado,
        fecha: gen.fecha,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    return {
      ...acta,
      operario_nombre: operario ? `${operario.nombre} ${operario.apellido ?? ''}`.trim() : 'Desconocido',
      operario_documento: operario?.documento ?? acta.documento_entrega,
      documento_recepcion: acta.documento_recepcion,
      residuos,
    };
  });
}

async function obtenerActasConciliadas() {
  const [actas, operarios, residuosEspecificos, categorias] = await Promise.all([
    obtenerActas(),
    obtenerOperarios(),
    obtenerResiduosEspecificos(),
    obtenerCategoriasResiduos(),
  ]);

  const actasGeneracionResiduos = await apiRequest<any[]>('/actas-generacion-residuo/');
  const generaciones = await apiRequest<any[]>('/generacion-residuo/');

  return actas
    .map((acta: any) => {
      const operario = operarios.find((o) => o.documento === acta.documento_entrega);
      const relaciones = actasGeneracionResiduos.filter(rel => rel.acta_id === acta.id);

      const residuos = relaciones.map(rel => {
        const gen = generaciones.find(g => g.id === rel.generacion_residuo_id);
        if (!gen) return null;

        const resEsp = residuosEspecificos.find(r => r.id === gen.residuo_id);
        const cat = categorias.find(c => c.id === resEsp?.categoria_id);

        return {
          acta_generacion_residuo_id: rel.id,
          residuo_id: gen.residuo_id,
          residuo_nombre: resEsp?.nombre ?? 'Sin nombre',
          categoria_nombre: cat?.nombre ?? 'Sin categoría',
          motivo: gen.motivo,
          motivo_otro: gen.motivo_otro ?? null,
          peso_reportado: rel.peso_reportado,
          peso_conciliado: rel.peso_conciliado ?? null,
          fecha: gen.fecha,
        };
      }).filter((r): r is NonNullable<typeof r> => r !== null);

      if (residuos.some(r => r.peso_conciliado != null)) {
        const peso_total_reportado = residuos.reduce((sum, r) => sum + parseFloat(r.peso_reportado), 0);
        const peso_total_conciliado = residuos.reduce((sum, r) => sum + parseFloat(r.peso_conciliado ?? '0'), 0);

        return {
          ...acta,
          operario_nombre: operario ? `${operario.nombre} ${operario.apellido ?? ''}`.trim() : 'Desconocido',
          operario_documento: operario?.documento ?? acta.documento_entrega,
          residuos,
          peso_total_reportado,
          peso_total_conciliado,
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
