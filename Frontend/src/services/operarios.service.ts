import { apiRequest } from './api.service';

// ===== TIPOS =====

export type Operario = {
  id: number;
  nombre: string;
  apellido?: string | null;
  documento?: string | null;
  subarea_id?: number | null;
  // Si necesitas el nombre de la subárea también
  subarea_nombre?: string | null;
};

type CrearOperarioPayload = {
  nombre: string;
  apellido?: string;
  documento: string;
  subarea_id?: number;
};

// ===== FUNCIONES DEL SERVICIO =====

/**
 * Obtener todos los operarios
 */
export async function obtenerOperarios(): Promise<Operario[]> {
  return apiRequest<Operario[]>('/operarios/');
}

/**
 * Buscar operario por cédula/documento
 */
export async function buscarOperarioPorCedula(cedula: string): Promise<Operario | null> {
  try {
    const operarios = await obtenerOperarios();
    const operario = operarios.find(op => op.documento === cedula);
    return operario || null;
  } catch (error) {
    console.error('Error al buscar operario:', error);
    return null;
  }
}

/**
 * Crear un nuevo operario
 */
export async function crearOperario(data: CrearOperarioPayload): Promise<Operario> {
  return apiRequest<Operario>('/operarios/', {
    method: 'POST',
    body: data,
  });
}

/**
 * Obtener o crear operario por cédula
 * Si existe, lo retorna. Si no existe, lo crea.
 */
export async function obtenerOCrearOperario(
  cedula: string, 
  nombre: string, 
  apellido: string,
  subarea_id?: number
): Promise<Operario> {
  // Buscar si ya existe
  const operarioExistente = await buscarOperarioPorCedula(cedula);
  
  if (operarioExistente) {
    return operarioExistente;
  }
  
  // Si no existe, crearlo
  return await crearOperario({
    documento: cedula,
    nombre,
    apellido,
    subarea_id,
  });
}

/**
 * Obtener operarios de punto verde (los que pueden conciliar)
 * Necesitamos las subáreas para identificar cuál es la de "Punto Verde"
 */
export async function obtenerOperariosPuntoVerde(subareas?: any[]): Promise<Operario[]> {
  try {
    const todosOperarios = await obtenerOperarios();
    
    // Si no tenemos las subáreas, no podemos filtrar
    if (!subareas || subareas.length === 0) {
      console.warn('No hay subáreas para identificar operarios de punto verde');
      return todosOperarios; // Fallback: devolver todos
    }
    
    // 1. Encontrar la subárea de "Punto Verde"
    const subareaPuntoVerde = subareas.find(subarea => 
      subarea.nombre.toLowerCase().includes('punto') && 
      subarea.nombre.toLowerCase().includes('verde')
    );
    
    if (!subareaPuntoVerde) {
      console.warn('No se encontró la subárea de Punto Verde');
      return todosOperarios; // Fallback
    }
    
    // 2. Filtrar operarios que pertenecen a esa subárea
    const operariosPV = todosOperarios.filter(op => 
      op.subarea_id === subareaPuntoVerde.id
    );
    
    return operariosPV;
    
  } catch (error) {
    console.error('Error al obtener operarios de punto verde:', error);
    return [];
  }
}

/**
 * Obtener operarios regulares (los que NO son de punto verde)
 */
export async function obtenerOperariosRegulares(subareas?: any[]): Promise<Operario[]> {
  try {
    const todosOperarios = await obtenerOperarios();
    const operariosPV = await obtenerOperariosPuntoVerde(subareas);
    
    // Obtener IDs de operarios de punto verde
    const idsPuntoVerde = operariosPV.map(op => op.id);
    
    // Filtrar excluyendo a los de punto verde
    return todosOperarios.filter(op => !idsPuntoVerde.includes(op.id));
    
  } catch (error) {
    console.error('Error al obtener operarios regulares:', error);
    return [];
  }
}

/**
 * Verificar si un operario es de punto verde (puede conciliar)
 */
export function esOperarioPuntoVerde(operario: Operario | null, subareas?: any[]): boolean {
  if (!operario || !operario.subarea_id || !subareas) return false;
  
  // Encontrar si su subárea es la de punto verde
  const subareaPuntoVerde = subareas.find(subarea => 
    subarea.nombre.toLowerCase().includes('punto') && 
    subarea.nombre.toLowerCase().includes('verde')
  );
  
  return subareaPuntoVerde ? operario.subarea_id === subareaPuntoVerde.id : false;
}