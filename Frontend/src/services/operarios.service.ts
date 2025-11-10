import { apiRequest } from './api.service';

// ===== TIPOS =====

export type Operario = {
  id: number;
  nombre: string;
  apellido?: string | null;
  documento?: string | null;
  subarea_id?: number | null;
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