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
  // Funciones para refrescar datos si es necesario
  refreshCatalogos: () => Promise<void>;
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
  const [procedencias, setProcedencias] = useState<Procedencia[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const cargarCatalogos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 useCatalogos: Iniciando carga de catálogos...');

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

      console.log('📊 useCatalogos: Datos recibidos de API:');
      console.log('- Áreas:', areasData.length);
      console.log('- Centros de costo:', centrosData.length);
      console.log('- SubÁreas:', subAreasData.length);
      console.log('- Residuos específicos:', residuosData.length);
      console.log('- Categorías de residuos:', categoriasData.length);
      console.log('- Procedencias:', procedenciasData.length);
      console.log('- Sedes:', sedesData.length);

      // DEPURACIÓN DETALLADA DE RESIDUOS Y CATEGORÍAS
      console.log('🔎 useCatalogos: DEPURACIÓN - Residuos específicos:');
      if (residuosData.length === 0) {
        console.warn('⚠️ No se recibieron residuos específicos de la API');
      } else {
        residuosData.forEach((r, i) => {
          console.log(`${i + 1}. "${r.nombre}" (id: ${r.id}, categoria_id: ${r.categoria_id})`);
        });
      }

      console.log('🔎 useCatalogos: DEPURACIÓN - Categorías de residuos:');
      if (categoriasData.length === 0) {
        console.warn('⚠️ No se recibieron categorías de residuos de la API');
      } else {
        categoriasData.forEach((c, i) => {
          console.log(`${i + 1}. "${c.nombre}" (id: ${c.id}, subarea_id: ${c.subarea_id})`);
        });
      }

      // BÚSQUEDA ESPECÍFICA DE "GENÉRICO" Y "OTRO"
      console.log('🎯 useCatalogos: Búsqueda específica:');
      
      // Buscar categoría GENÉRICO (con diferentes variaciones)
      const categoriaGenerica = categoriasData.find(c => {
        const nombre = c.nombre ? c.nombre.toUpperCase() : '';
        return nombre.includes('GENÉRICO') || nombre.includes('GENERICO') || nombre.includes('GENÉRICA');
      });
      
      console.log('🔍 Categoría "GENÉRICO" encontrada:', categoriaGenerica);
      
      if (categoriaGenerica) {
        console.log(`✅ Categoría GENÉRICO: ID=${categoriaGenerica.id}, Nombre="${categoriaGenerica.nombre}", Subarea_id=${categoriaGenerica.subarea_id}`);
      } else {
        console.warn('❌ Categoría "GENÉRICO" NO encontrada en los datos de API');
        // Mostrar todas las categorías para debug
        console.log('📋 Todas las categorías disponibles:');
        categoriasData.forEach(c => {
          console.log(`  - "${c.nombre}" (subarea_id: ${c.subarea_id})`);
        });
      }

      // Buscar residuo Otro (con diferentes variaciones)
      const residuoOtro = residuosData.find(r => {
        const nombre = r.nombre ? r.nombre.toLowerCase() : '';
        return nombre === 'otro' || nombre.includes('otro ') || nombre.includes(' otro');
      });
      
      console.log('🔍 Residuo "Otro" encontrado:', residuoOtro);
      
      if (residuoOtro) {
        console.log(`✅ Residuo Otro: ID=${residuoOtro.id}, Nombre="${residuoOtro.nombre}", Categoria_id=${residuoOtro.categoria_id}`);
        
        // Verificar si está asociado a categoría GENÉRICO
        if (categoriaGenerica && residuoOtro.categoria_id === categoriaGenerica.id) {
          console.log('✅ Residuo "Otro" correctamente asociado a categoría "GENÉRICO"');
        } else {
          console.warn('⚠️ Residuo "Otro" NO está asociado a categoría "GENÉRICO"');
        }
      } else {
        console.warn('❌ Residuo "Otro" NO encontrado en los datos de API');
      }

      // Verificar si hay categorías con subarea_id = NULL (globales)
      const categoriasGlobales = categoriasData.filter(c => c.subarea_id === null || c.subarea_id === undefined);
      console.log(`📊 Categorías globales (subarea_id=NULL): ${categoriasGlobales.length}`);
      categoriasGlobales.forEach(c => {
        console.log(`  - "${c.nombre}" (id: ${c.id})`);
      });

      // Verificar residuos de categorías globales
      if (categoriaGenerica) {
        const residuosDeGenerico = residuosData.filter(r => r.categoria_id === categoriaGenerica.id);
        console.log(`📊 Residuos de categoría GENÉRICO: ${residuosDeGenerico.length}`);
        residuosDeGenerico.forEach(r => {
          console.log(`  - "${r.nombre}" (id: ${r.id})`);
        });
      }

      // Establecer los estados
      setAreas(areasData);
      setCentrosCosto(centrosData);
      setSubAreas(subAreasData);
      setResiduosEspecificos(residuosData);
      setCategoriasResiduos(categoriasData);
      setProcedencias(procedenciasData);
      setSedes(sedesData);

      console.log('✅ useCatalogos: Catálogos cargados exitosamente');

    } catch (err) {
      console.error('❌ useCatalogos: Error al cargar catálogos:', err);
      setError('Error al cargar los datos. Por favor, recarga la página.');
      
      // Establecer arrays vacíos para evitar errores
      setAreas([]);
      setCentrosCosto([]);
      setSubAreas([]);
      setResiduosEspecificos([]);
      setCategoriasResiduos([]);
      setProcedencias([]);
      setSedes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, [refreshTrigger]);

  // Función para refrescar manualmente
  const refreshCatalogos = async () => {
    console.log('🔄 Refrescando catálogos...');
    setRefreshTrigger(prev => prev + 1);
  };

  // Función para agregar residuo "Otro" si no existe (como respaldo)
  const residuosConRespaldo = [...residuosEspecificos];
  const categoriasConRespaldo = [...categoriasResiduos];
  
  // Verificar si necesitamos agregar respaldo
  const tieneCategoriaGenerico = categoriasResiduos.some(c => 
    c.nombre && (c.nombre.toUpperCase().includes('GENÉRICO') || c.nombre.toUpperCase().includes('GENERICO'))
  );
  
  const tieneResiduoOtro = residuosEspecificos.some(r => 
    r.nombre && r.nombre.toLowerCase().includes('otro')
  );
  
  if (!tieneResiduoOtro && !loading) {
    console.warn('⚠️ useCatalogos: Agregando residuo "Otro" como respaldo');
    
    // Buscar o crear categoría GENÉRICO de respaldo
    let categoriaGenericaId = categoriasResiduos.find(c => 
      c.subarea_id === null || c.subarea_id === undefined
    )?.id || 99999;
    
    const residuoOtroRespaldo: ResiduoEspecifico = {
      id: 999999,
      nombre: 'Otro',
      categoria_id: categoriaGenericaId
    };
    
    residuosConRespaldo.push(residuoOtroRespaldo);
  }

  return {
    areas,
    centrosCosto,
    subAreas,
    residuosEspecificos: residuosConRespaldo, // Usamos la versión con respaldo
    categoriasResiduos: categoriasConRespaldo,
    procedencias,
    sedes,
    loading,
    error,
    refreshCatalogos
  };
}

// Exportar función auxiliar para debug
export function debugCatalogos(catalogos: UseCatalogosReturn) {
  console.log('=== DEBUG CATÁLOGOS ===');
  console.log('Residuos totales:', catalogos.residuosEspecificos.length);
  console.log('Categorías totales:', catalogos.categoriasResiduos.length);
  
  const residuosOtro = catalogos.residuosEspecificos.filter(r => 
    r.nombre && r.nombre.toLowerCase().includes('otro')
  );
  console.log('Residuos "Otro":', residuosOtro);
  
  const categoriasGenerico = catalogos.categoriasResiduos.filter(c => 
    c.nombre && c.nombre.toUpperCase().includes('GENÉRICO')
  );
  console.log('Categorías "GENÉRICO":', categoriasGenerico);
  
  return {
    tieneOtro: residuosOtro.length > 0,
    tieneGenerico: categoriasGenerico.length > 0
  };
}