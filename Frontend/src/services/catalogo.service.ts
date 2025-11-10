import { apiRequest } from './api.service';

// ===== TIPOS =====

export type Area = {
  id: number;
  nombre: string;
  procedencia_id: number;
};

export type CentroCosto = {
  id: number;
  codigo: string;
  nombre: string;
  clase_movimiento?: number | null;
  subarea_id?: number | null;
};

export type SubArea = {
  id: number;
  nombre: string;
  area_id: number;
};

export type ResiduoEspecifico = {
  id: number;
  nombre: string;
  categoria_id: number;
};

export type CategoriaResiduo = {
  id: number;
  nombre: string;
  subarea_id: number;
};

export type Procedencia = {
  id: number;
  nombre: string;
  sede_id: number;
};

export type Sede = {
  id: number;
  nombre: string;
};

// ===== FUNCIONES DEL SERVICIO =====

/**
 * Obtener todas las áreas
 */
export async function obtenerAreas(): Promise<Area[]> {
  return apiRequest<Area[]>('/areas/');
}

/**
 * Obtener todos los centros de costo
 */
export async function obtenerCentrosCosto(): Promise<CentroCosto[]> {
  return apiRequest<CentroCosto[]>('/centros-costos/');
}

/**
 * Obtener todas las sub-áreas
 */
export async function obtenerSubAreas(): Promise<SubArea[]> {
  return apiRequest<SubArea[]>('/sub-area/');
}

/**
 * Obtener todos los residuos específicos
 */
export async function obtenerResiduosEspecificos(): Promise<ResiduoEspecifico[]> {
  return apiRequest<ResiduoEspecifico[]>('/residuos-especificos/');
}

/**
 * Obtener todas las categorías de residuos
 */
export async function obtenerCategoriasResiduos(): Promise<CategoriaResiduo[]> {
  return apiRequest<CategoriaResiduo[]>('/categorias-residuos/');
}

/**
 * Obtener todas las procedencias
 */
export async function obtenerProcedencias(): Promise<Procedencia[]> {
  return apiRequest<Procedencia[]>('/procedencias/');
}

/**
 * Obtener todas las sedes
 */
export async function obtenerSedes(): Promise<Sede[]> {
  return apiRequest<Sede[]>('/sedes/');
}