import { useState, useEffect } from 'react';
import {
  obtenerAreas,
  obtenerCentrosCosto,
  obtenerSubAreas,
  obtenerResiduosEspecificos,
  obtenerCategoriasResiduos,
  obtenerProcedencias,
  obtenerSedes,
  type Area,
  type CentroCosto,
  type SubArea,
  type ResiduoEspecifico,
  type CategoriaResiduo,
  type Procedencia,
  type Sede
} from '../services/catalogo.service';

type UseCatalogosReturn = {
  areas: Area[];
  centrosCosto: CentroCosto[];
  subAreas: SubArea[];
  residuosEspecificos: ResiduoEspecifico[];
  categoriasResiduos: CategoriaResiduo[];
  procedencias: Procedencia[];
  sedes: Sede[];
  loading: boolean;
  error: string | null;
};

/**
 * Hook personalizado para cargar todos los catálogos necesarios
 */
export default function useCatalogos(): UseCatalogosReturn {
  const [areas, setAreas] = useState<Area[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([]);
  const [subAreas, setSubAreas] = useState<SubArea[]>([]);
  const [residuosEspecificos, setResiduosEspecificos] = useState<ResiduoEspecifico[]>([]);
  const [categoriasResiduos, setCategoriasResiduos] = useState<CategoriaResiduo[]>([]);
  const [procedencias, setProcedencias] = useState<Procedencia[]>([]);  // ✅ Agregado
  const [sedes, setSedes] = useState<Sede[]>([]);  // ✅ Agregado
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar todos los catálogos en paralelo
        const [
          areasData,
          centrosData,
          subAreasData,
          residuosData,
          categoriasData,
          procedenciasData,  
          sedesData  
        ] = await Promise.all([
          obtenerAreas(),
          obtenerCentrosCosto(),
          obtenerSubAreas(),
          obtenerResiduosEspecificos(),
          obtenerCategoriasResiduos(),
          obtenerProcedencias(),  
          obtenerSedes()  
        ]);

        setAreas(areasData);
        setCentrosCosto(centrosData);
        setSubAreas(subAreasData);
        setResiduosEspecificos(residuosData);
        setCategoriasResiduos(categoriasData);
        setProcedencias(procedenciasData);  
        setSedes(sedesData);  
      } catch (err) {
        console.error('Error al cargar catálogos:', err);
        setError('Error al cargar los datos. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    cargarCatalogos();
  }, []);

  return {
    areas,
    centrosCosto,
    subAreas,
    residuosEspecificos,
    categoriasResiduos,
    procedencias,  
    sedes,  
    loading,
    error
  };
}