import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { obtenerActasConciliadas } from '../../services/actasConciliadas.service';
import { obtenerSubAreas, obtenerCentrosCosto } from '../../services/catalogo.service';
import { obtenerOperarios } from '../../services/operarios.service';
import { useFiltroActas } from '../../hooks/use.FilteredDateActas';
import FilteredDateActas from '../../components/common/FilteredDateActas';
import { sortByDateDesc } from "../../utils/sortByDate";

type ResiduoConciliado = {
  residuo_nombre: string;
  residuo_otro?: string | null;
  descripcion_residuo_otro?: string;
  categoria_nombre: string;
  motivo: string;
  motivo_otro?: string | null;
  descripcion_motivo_otro?: string;
  peso_reportado: string | number;
  peso_conciliado: string | number;
  descripcion_novedad?: string;
  fecha: string;
  fecha_conciliacion?: string;
};

type ActaConciliada = {
  id: number;
  numero_acta: string;
  numero_inventario?: string;
  consecutivo?: string;
  fecha_acta: string;
  fecha_conciliacion?: string;
  operario_nombre: string;
  operario_documento: string;
  documento_recepcion: string;
  conciliador_nombre?: string;
  conciliador_documento?: string;
  peso_total_reportado: number;
  peso_total_conciliado: number;
  subarea?: string;
  subarea_id?: number;
  subarea_nombre?: string;
  centro_costo_codigo?: string | null;
  centro_costo_id?: number;
  centro_costo_nombre?: string;
  residuos: ResiduoConciliado[];
  tipo?: "pendiente" | "conciliada" | "con_novedad";
  novedad?: string;
};

export default function ActasConciliadas() {
  const location = useLocation();
  const [actas, setActas] = useState<ActaConciliada[]>([]);
  const [actasFiltradas, setActasFiltradas] = useState<ActaConciliada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subareasMap, setSubareasMap] = useState<Record<number, string>>({});
  const [centrosCostoMap, setCentrosCostoMap] = useState<Record<number, string>>({});
  const [operariosMap, setOperariosMap] = useState<Record<string, string>>({});

  const { 
    busqueda, setBusqueda, 
    fechaInicio, setFechaInicio, 
    fechaFin, setFechaFin, 
    filtrar: filtrarOriginal, 
    limpiarFiltros 
  } = useFiltroActas(actasFiltradas, [
    "numero_acta",
    "operario_nombre",
    "operario_documento",
    "conciliador_nombre",
    "documento_recepcion",
    "numero_inventario",
    "consecutivo",
    "subarea_nombre"
  ]);

  // Filtrar solo actas conciliadas
  const filtrar = () => {
    // Primero aplicamos el filtro de búsqueda sobre las actas ya filtradas (solo conciliadas)
    const resultado = filtrarOriginal();
    
    // Aseguramos que todas las actas tengan fecha_conciliacion
    return resultado.filter(acta => {
      const estaConciliada = acta.fecha_conciliacion && acta.fecha_conciliacion.trim() !== '';
      const tienePesoConciliado = acta.peso_total_conciliado > 0;
      const tieneConciliador = acta.conciliador_nombre || acta.conciliador_documento;
      
      return estaConciliada && tienePesoConciliado && tieneConciliador;
    });
  };

  useEffect(() => {
    console.log('🔄 ActasConciliadas - Montando/Actualizando');
    console.log('📍 Ruta actual:', location.pathname);
    
    cargarTodo();
    
    return () => {
      console.log('🧹 ActasConciliadas - Limpiando');
    };
  }, [location.pathname]);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        cargarSubareas(),
        cargarCentrosCostos(),
        cargarOperarios(),
        cargarActas()
      ]);
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const cargarSubareas = async () => {
    try {
      const data = await obtenerSubAreas();
      const map: Record<number, string> = {};
      data.forEach(s => { 
        if (s?.id != null) {
          const nombre = s.nombre || '';
          map[s.id] = nombre ? nombre : `Subárea ${s.id}`;
        }
      });
      setSubareasMap(map);
    } catch (err) {
      console.error('Error cargando subáreas:', err);
    }
  };

  const cargarCentrosCostos = async () => {
    try {
      const data = await obtenerCentrosCosto();
      const map: Record<number, string> = {};
      data.forEach(c => { 
        if (c?.id != null) {
          const nombre = c.nombre || '';
          const codigo = c.codigo || '';
          map[c.id] = nombre ? `${codigo} - ${nombre}`.trim() : codigo;
        }
      });
      setCentrosCostoMap(map);
    } catch (err) {
      console.error('Error cargando centros de costo:', err);
    }
  };

  const cargarOperarios = async () => {
    try {
      const data = await obtenerOperarios();
      const map: Record<string, string> = {};
      data.forEach((op: any) => {
        const documento = op.documento || '';
        if (documento) {
          const nombre = op.nombre || '';
          const apellido = op.apellido || '';
          const nombreCompleto = `${nombre} ${apellido}`.trim();
          if (nombreCompleto) {
            map[documento] = nombreCompleto;
          }
        }
      });
      setOperariosMap(map);
    } catch (err) {
      console.error('Error cargando operarios:', err);
    }
  };

  const cargarActas = async () => {
    try {
      console.log('📥 Iniciando carga de actas conciliadas...');
      const data = await obtenerActasConciliadas();
      console.log('📊 Datos recibidos del servicio:', data);

      if (!data || data.length === 0) {
        console.log('ℹ️ No hay actas conciliadas');
        setActas([]);
        setActasFiltradas([]);
        return;
      }

      const actasProcesadas = data.map((acta: any) => {
        const pesoTotalReportado = (acta.residuos || []).reduce((sum: number, r: any) => 
          sum + Number(r.peso_reportado || 0), 0);
        
        const pesoTotalConciliado = (acta.residuos || []).reduce((sum: number, r: any) => 
          sum + Number(r.peso_conciliado || 0), 0);

        const tieneNovedad = Boolean(acta.novedad) || 
          (acta.residuos || []).some((r: any) => r.descripcion_novedad);

        const residuosProcesados: ResiduoConciliado[] = (acta.residuos || []).map((r: any) => ({
          ...r,
          peso_reportado: Number(r.peso_reportado || 0),
          peso_conciliado: Number(r.peso_conciliado || 0),
          residuo_otro: r.residuo_otro || r.descripcion_residuo_otro || null,
          descripcion_residuo_otro: r.descripcion_residuo_otro || r.residuo_otro || '',
          motivo_otro: r.motivo_otro || r.descripcion_motivo_otro || null,
          descripcion_motivo_otro: r.descripcion_motivo_otro || r.motivo_otro || '',
        }));

        return {
          id: acta.id || 0,
          acta_id: acta.acta_id || 0,
          numero_acta: acta.numero_acta || '',
          fecha_acta: acta.fecha_acta || '',
          fecha_conciliacion: acta.fecha_conciliacion || '',
          operario_nombre: acta.operario_nombre || '',
          operario_documento: acta.operario_documento || '',
          conciliador_nombre: acta.conciliador_nombre || '',
          conciliador_documento: acta.conciliador_documento || '',
          documento_recepcion: acta.conciliador_documento || acta.documento_recepcion || '',
          peso_total_reportado: pesoTotalReportado,
          peso_total_conciliado: pesoTotalConciliado,
          subarea: acta.subarea_nombre || acta.subarea || '',
          subarea_id: acta.subarea_id,
          subarea_nombre: acta.subarea_nombre || '',
          centro_costo_codigo: acta.centro_costo_codigo || '',
          centro_costo_id: acta.centro_costo_id,
          centro_costo_nombre: acta.centro_costo_nombre || '',
          consecutivo: acta.consecutivo || '',
          numero_inventario: acta.numero_inventario || '',
          residuos: residuosProcesados,
          tipo: acta.tipo || 'conciliada',
          novedad: acta.novedad || '',
          tiene_novedad: tieneNovedad,
        };
      });

      console.log(`✅ ${actasProcesadas.length} actas procesadas`);
      
      // Filtrar solo las actas que están conciliadas
      const actasConciliadas = actasProcesadas.filter(acta => {
        // Verificar si la acta está conciliada
        const estaConciliada = acta.fecha_conciliacion && acta.fecha_conciliacion.trim() !== '';
        const tienePesoConciliado = acta.peso_total_conciliado > 0;
        const tieneConciliador = acta.conciliador_nombre || acta.conciliador_documento;
        
        return estaConciliada && tienePesoConciliado && tieneConciliador;
      });
      
      console.log(`📊 ${actasConciliadas.length} actas conciliadas encontradas`);
      
      const actasOrdenadas = sortByDateDesc(actasConciliadas, 'fecha_conciliacion');
      setActas(actasOrdenadas);
      setActasFiltradas(actasOrdenadas);
      
    } catch (error) {
      console.error('❌ Error cargando actas conciliadas:', error);
      setError('Error al cargar las actas conciliadas. Por favor, intente nuevamente.');
    }
  };

  const obtenerInfoResiduo = (residuo: ResiduoConciliado) => {
    const nombreResiduo = residuo.residuo_nombre?.toLowerCase() || '';
    const esPeligroso = nombreResiduo.includes('peligroso');
    const esOtroResiduo = nombreResiduo.includes('otro residuo') && !esPeligroso;
    const esOtroGenerico = nombreResiduo === 'otro';
    const esMEConMarca = nombreResiduo.includes('me con marca') || nombreResiduo.includes('me - con marca');
    const esMESinMarca = nombreResiduo.includes('me sin marca') || nombreResiduo.includes('me - sin marca');
    
    let tipoEspecifico = '';
    if (esPeligroso) {
      tipoEspecifico = 'Peligroso';
    } else if (esMEConMarca) {
      tipoEspecifico = 'ME - Con marca';
    } else if (esMESinMarca) {
      tipoEspecifico = 'ME - Sin marca';
    } else if (esOtroResiduo) {
      tipoEspecifico = 'Otro residuo';
    } else if (esOtroGenerico) {
      tipoEspecifico = 'Otro';
    }
    
    const especificacion = residuo.residuo_otro || residuo.descripcion_residuo_otro || '';
    
    return {
      nombreBase: residuo.residuo_nombre,
      especificacion: especificacion,
      esPeligroso,
      esOtroResiduo,
      esOtroGenerico,
      esMEConMarca,
      esMESinMarca,
      tipoEspecifico,
      tieneEspecificacion: !!especificacion && especificacion.trim() !== '',
    };
  };

  const obtenerNombreResiduoCompleto = (residuo: ResiduoConciliado) => {
    const info = obtenerInfoResiduo(residuo);
    return info.nombreBase;
  };

  const obtenerDetalleResiduo = (residuo: ResiduoConciliado) => {
    const info = obtenerInfoResiduo(residuo);
    
    if (info.tieneEspecificacion) {
      return info.especificacion;
    }
    
    return null;
  };

  const obtenerTipoResiduo = (residuo: ResiduoConciliado) => {
    const info = obtenerInfoResiduo(residuo);
    return info.tipoEspecifico;
  };

  const renderSubarea = (subareaId?: number | null, subareaName?: string | null) => {
    const nombre = (subareaName || '').trim();
    if (nombre !== '') return nombre;
    if (subareaId != null && subareasMap[subareaId]) return subareasMap[subareaId];
    return 'Sin subárea';
  };

  const renderCentroCosto = (
    centroCostoId?: number | null, 
    centroCostoCodigo?: string | null, 
    centroCostoNombre?: string | null
  ) => {
    const nombre = (centroCostoNombre || '').trim();
    const codigo = (centroCostoCodigo || '').trim();
    
    if (nombre !== '' && codigo !== '') {
      return `${codigo} - ${nombre}`;
    }
    if (codigo !== '') return codigo;
    if (centroCostoId != null && centrosCostoMap[centroCostoId]) return centrosCostoMap[centroCostoId];
    return 'Sin centro de costo';
  };

  const renderOperarioRecepcion = (acta: ActaConciliada) => {
    const nombre = (acta.conciliador_nombre || '').trim();
    const documento = (acta.conciliador_documento || '').trim();
    
    if (nombre !== '') {
      return `${nombre} (${documento})`;
    }
    
    if (documento && operariosMap[documento]) {
      return `${operariosMap[documento]} (${documento})`;
    }
    
    return documento ? `Documento: ${documento}` : 'No especificado';
  };

  const handleRefrescar = () => {
    cargarTodo();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-skyBlue mx-auto mb-4"></div>
          <p className="text-xl">Cargando actas conciliadas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <button
            onClick={handleRefrescar}
            className="px-4 py-2 bg-skyBlue text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (actas.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-4">No hay actas conciliadas todavía.</p>
          <button
            onClick={handleRefrescar}
            className="px-4 py-2 bg-skyBlue text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue">
          Actas Conciliadas
        </h1>
        <button
          onClick={handleRefrescar}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Actualizar
        </button>
      </div>

      <FilteredDateActas
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        limpiarFiltros={limpiarFiltros}
      />

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {filtrar().map((acta) => {
          const diferencia = acta.peso_total_conciliado - acta.peso_total_reportado;
          const tieneNovedad = acta.novedad || 
            (acta as any).tiene_novedad || 
            acta.residuos.some(r => (r as any).descripcion_novedad);

          return (
            <div key={`${acta.id}-${acta.numero_acta}`} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm">

              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="font-bold text-xl text-gray-800 dark:text-gray-200">Acta {acta.numero_acta}</h2>
                  {tieneNovedad && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      ⚠️ Novedad
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✅ Conciliada
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Acta: {new Date(acta.fecha_acta).toLocaleDateString('es-CO')}
                  </p>
                  {acta.fecha_conciliacion && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                      Conciliado: {new Date(acta.fecha_conciliacion).toLocaleDateString('es-CO')}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                {acta.consecutivo && <p><span className="font-semibold">Consecutivo:</span> {acta.consecutivo}</p>}
                {acta.numero_inventario && <p><span className="font-semibold">Número de Inventario:</span> {acta.numero_inventario}</p>}
                <p><span className="font-semibold">Subárea:</span> {renderSubarea(acta.subarea_id, acta.subarea_nombre || acta.subarea)}</p>
                <p><span className="font-semibold">Centro de Costo:</span> {renderCentroCosto(acta.centro_costo_id, acta.centro_costo_codigo, acta.centro_costo_nombre)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Entregado por:</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {acta.operario_nombre} ({acta.operario_documento})
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">📋 Conciliado por:</p>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {renderOperarioRecepcion(acta)}
                  </p>
                </div>
              </div>

              {acta.novedad && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm">📝 Novedad:</p>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">{acta.novedad}</p>
                </div>
              )}

              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">Peso Reportado</p>
                  <p className="text-2xl font-bold">{acta.peso_total_reportado.toFixed(2)} kg</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600 dark:text-green-400">Peso Conciliado</p>
                  <p className="text-2xl font-bold">{acta.peso_total_conciliado.toFixed(2)} kg</p>
                </div>
              </div>

              {Math.abs(diferencia) > 0.01 && (
                <div className={`mt-3 p-3 rounded text-center ${
                  diferencia > 0 
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  <p className="font-semibold">
                    {diferencia > 0 ? '📈 Sobrante:' : '📉 Faltante:'} {Math.abs(diferencia).toFixed(2)} kg
                    {acta.peso_total_reportado > 0 && (
                      <span className="text-sm font-normal ml-2">
                        ({((Math.abs(diferencia) / acta.peso_total_reportado) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold text-lg text-gray-700 dark:text-gray-300 mb-2">
                  Detalle de Residuos ({acta.residuos.length})
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border px-3 py-3 text-left text-sm font-semibold w-1/5">Residuo</th>
                        <th className="border px-3 py-3 text-left text-sm font-semibold w-1/4">Detalle</th>
                        <th className="border px-3 py-3 text-left text-sm font-semibold w-1/6">Motivo</th>
                        <th className="border px-3 py-3 text-right text-sm font-semibold w-1/6">Peso Reportado</th>
                        <th className="border px-3 py-3 text-right text-sm font-semibold w-1/6">Peso Conciliado</th>
                        <th className="border px-3 py-3 text-center text-sm font-semibold w-1/6">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acta.residuos.map((r, idx) => {
                        const infoResiduo = obtenerInfoResiduo(r);
                        const detalle = obtenerDetalleResiduo(r);
                        const tipoResiduo = obtenerTipoResiduo(r);
                        const pesoReportado = Number(r.peso_reportado || 0);
                        const pesoConciliado = Number(r.peso_conciliado || 0);
                        const diferenciaResiduo = pesoConciliado - pesoReportado;
                        const tieneNovedadRes = (r as any).descripcion_novedad;
                        
                        return (
                          <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                            tieneNovedadRes ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                          }`}>
                            {/* RESIDUO */}
                            <td className="border px-3 py-3 align-top">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {obtenerNombreResiduoCompleto(r)}
                              </div>
                              {infoResiduo.esPeligroso && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                    ⚠️ Peligroso
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* ESPECIFICACIÓN */}
                            <td className="border px-3 py-3 align-top">
                              {infoResiduo.tieneEspecificacion ? (
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {detalle}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    ({tipoResiduo})
                                  </div>
                                </div>
                              ) : (
                                <div className="text-gray-400 dark:text-gray-500 italic text-sm">
                                  —
                                </div>
                              )}
                            </td>

                            {/* MOTIVO */}
                            <td className="border px-3 py-3 align-top">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {r.motivo}
                                </span>
                                {(r.motivo_otro || r.descripcion_motivo_otro) && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {r.motivo_otro || r.descripcion_motivo_otro}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* PESO REPORTADO */}
                            <td className="border px-3 py-3 text-right align-top">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {pesoReportado.toFixed(2)} kg
                              </div>
                            </td>

                            {/* PESO CONCILIADO */}
                            <td className="border px-3 py-3 text-right align-top">
                              <div className="flex flex-col items-end">
                                <div className="font-bold text-lg text-gray-900 dark:text-white">
                                  {pesoConciliado.toFixed(2)} kg
                                </div>
                                {Math.abs(diferenciaResiduo) > 0.01 && (
                                  <div className={`text-xs px-2 py-0.5 rounded mt-1 ${
                                    diferenciaResiduo > 0 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {diferenciaResiduo > 0 ? '+' : ''}{diferenciaResiduo.toFixed(2)} kg
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* ESTADO */}
                            <td className="border px-3 py-3 text-center align-top">
                              {tieneNovedadRes ? (
                                <div className="flex flex-col items-center">
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                    ⚠️ Novedad
                                  </span>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-[120px] truncate" title={tieneNovedadRes}>
                                    {typeof tieneNovedadRes === 'string' ? tieneNovedadRes.substring(0, 30) + '...' : ''}
                                  </div>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  ✓ Conciliado
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}