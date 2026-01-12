//ActasOperarioPuntoVerde.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerActasCompletas } from '../../services/actas.service';
import { obtenerSubAreas } from '../../services/catalogo.service'; 
import Button from '../../components/common/Button';
import { useFiltroActas } from '../../hooks/use.FilteredDateActas';
import FilteredDateActas from '../../components/common/FilteredDateActas';
import { sortByDateDesc } from "../../utils/sortByDate";

type Residuo = {
  residuo_id: number;
  residuo_nombre: string;
  residuo_otro?: string | null;
  categoria_nombre: string;
  motivo: string;
  motivo_otro?: string | null;
  peso_reportado: string;
  fecha: string;
};

type Acta = {
  id: number;
  numero_acta: string;
  numero_inventario?: string;
  consecutivo?: string;
  fecha_acta: string;
  operario_nombre: string;
  operario_documento: string;
  centro_costo_id: number;
  centro_costo_codigo?: string | null;
  subarea_id?: number | null;
  subarea?: string | null;
  residuos: Residuo[];
  documento_recepcion?: string;
};

type Subarea = {
  id: number;
  nombre: string;
  area_id?: number;
  // otros campos si los hay...
};

export default function ActasOperarioPuntoVerde() {
  const [actas, setActas] = useState<Acta[]>([]);
  const [subareasMap, setSubareasMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingSubareas, setLoadingSubareas] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { 
    busqueda, setBusqueda, 
    fechaInicio, setFechaInicio, 
    fechaFin, setFechaFin, 
    filtrar, limpiarFiltros 
  } = useFiltroActas<Acta>(actas, [
    "numero_acta",
    "operario_nombre",
    "operario_documento",
    "numero_inventario",
    "consecutivo",
  ]);

  useEffect(() => {
    cargarSubareas(); // cargamos subáreas al montar
    cargarActas();
  }, []);

  const cargarSubareas = async () => {
    try {
      setLoadingSubareas(true);
      const data: Subarea[] = await obtenerSubAreas(); 
      const map: Record<number, string> = {};
      data.forEach(s => {
        if (s?.id != null) map[s.id] = s.nombre ?? `Subárea ${s.id}`;
      });
      setSubareasMap(map);
    } catch (err) {
      console.error('Error cargando subáreas:', err);
      // no mostramos error crítico: solo dejamos el mapa vacío y el componente caerá en "Sin subárea"
    } finally {
      setLoadingSubareas(false);
    }
  };

  const cargarActas = async () => {
    try {
      setLoading(true);
      const data = await obtenerActasCompletas();

      const pendientes = data.filter(a => !a.documento_recepcion);
      const ordenadas = sortByDateDesc(pendientes, "fecha_acta");

      setActas(ordenadas);
      setError('');
    } catch (err) {
      console.error('Error cargando actas:', err);
      setError('No se pudieron cargar las actas.');
    } finally {
      setLoading(false);
    }
  };

  const calcularPesoTotal = (residuos: Residuo[]): number => {
    return residuos.reduce((total, r) => total + (parseFloat(r.peso_reportado) || 0), 0);
  };

  // Función para obtener la información completa del residuo (MISMA LÓGICA)
  const obtenerInfoResiduo = (residuo: Residuo) => {
    const nombreResiduo = residuo.residuo_nombre?.toLowerCase() || '';
    const esPeligroso = nombreResiduo.includes('peligroso');
    const esOtroResiduo = nombreResiduo.includes('otro residuo') && !nombreResiduo.includes('peligroso');
    const esOtroGenerico = nombreResiduo === 'otro';
    
    return {
      nombreBase: residuo.residuo_nombre,
      especificacion: residuo.residuo_otro,
      esPeligroso,
      esOtroResiduo,
      esOtroGenerico,
      tieneEspecificacion: !!residuo.residuo_otro && residuo.residuo_otro.trim() !== ''
    };
  };

  // Función para formatear la fecha (MISMA LÓGICA)
  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    const opciones: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return fecha.toLocaleDateString('es-CO', opciones);
  };

  const actasFiltradas = filtrar();

  const renderSubarea = (acta: Acta) => {
    // Prioridad: acta.subarea (nombre) > lookup por subarea_id > fallback
    if (acta.subarea && acta.subarea.trim() !== '') return acta.subarea;
    if (acta.subarea_id != null && subareasMap[acta.subarea_id]) return subareasMap[acta.subarea_id];
    return 'Sin subárea';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue mb-6">
        Actas para Conciliar - Punto Verde
      </h1>

      {/* Filtros */}
      <FilteredDateActas
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        limpiarFiltros={limpiarFiltros}
        onRefrescar={cargarActas}
        loading={loading}
      />

      {error ? (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-skyBlue"></div>
          <p className="ml-4 text-gray-500">Cargando actas...</p>
        </div>
      ) : actasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 text-lg">
            {actas.length === 0
              ? '📋 No hay actas registradas.'
              : '🔍 No se encontraron actas con los filtros aplicados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {actasFiltradas.map((acta) => {
            const pesoTotal = calcularPesoTotal(acta.residuos);

            return (
              <div key={acta.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">

                {/* HEADER */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                      {acta.numero_acta}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      📅 {new Date(acta.fecha_acta).toLocaleDateString('es-CO', { 
                         day: '2-digit',
                         month: 'long',
                         year: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-skyBlue/10 dark:bg-lightBlue/10 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Residuos</p>
                      <p className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                        {acta.residuos.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 🔵 CONSECU, INVENTARIO Y SUBÁREA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1 mb-6">

                    {acta.consecutivo && (
                      <p>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Consecutivo:</span>{" "}
                        {acta.consecutivo}
                      </p>
                    )}

                    {acta.numero_inventario && (
                      <p>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Número de Inventario:</span>{" "}
                        {acta.numero_inventario}
                      </p>
                    )}

                    {/* SHOW SUBAREA */}
                    <p>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Área:</span>{" "}
                      { renderSubarea(acta) }
                    </p>

                     {/* CENTRO DE COSTOS (solo código) */}
                      {acta.centro_costo_codigo && (
                        <p>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Centro de Costo:</span>{" "}
                          {acta.centro_costo_codigo}
                        </p>
                      )}
                  </div>
                </div>

                {/* OPERARIO */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300">
                    👤 Operario que entrega
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cédula</p>
                      <p className="font-semibold">{acta.operario_documento}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                      <p className="font-semibold">{acta.operario_nombre}</p>
                    </div>
                  </div>
                </div>

                {/* RESIDUOS - TABLA CON LA MISMA LÓGICA */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>♻️ Residuos Reportados</span>
                    <span className="text-base font-normal bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                      Peso Total: {pesoTotal.toFixed(2)} kg
                    </span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="p-3 border">Residuo</th>
                          <th className="p-3 border">Detalle</th>
                          <th className="p-3 border">Motivo</th>
                          <th className="p-3 border text-right">Peso (kg)</th>
                          <th className="p-3 border">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acta.residuos.map((r, i) => {
                          const infoResiduo = obtenerInfoResiduo(r);
                          
                          return (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              {/* RESIDUO - MISMA LÓGICA */}
                              <td className="p-3 border align-top">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {infoResiduo.nombreBase}
                                </div>
                                {infoResiduo.esPeligroso && (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                      ⚠️ Peligroso
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* DETALLE - MISMA LÓGICA */}
                              <td className="p-3 border align-top">
                                {infoResiduo.tieneEspecificacion ? (
                                  <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                      {infoResiduo.especificacion}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-gray-400 dark:text-gray-500 italic text-sm">
                                    —
                                  </div>
                                )}
                              </td>

                              {/* MOTIVO - MISMA LÓGICA */}
                              <td className="p-3 border align-top">
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {r.motivo === 'Otro' && r.motivo_otro
                                      ? 'Otro'
                                      : r.motivo}
                                  </span>
                                  {r.motivo === 'Otro' && r.motivo_otro && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {r.motivo_otro}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* PESO - MISMA LÓGICA */}
                              <td className="p-3 border text-right align-top">
                                <div className="font-bold text-lg text-gray-900 dark:text-white">
                                  {parseFloat(r.peso_reportado).toFixed(2)}
                                </div>
                              </td>

                              {/* FECHA - MISMA LÓGICA */}
                              <td className="p-3 border align-top">
                                <div className="text-gray-900 dark:text-white font-medium">
                                  {formatearFecha(r.fecha)}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* BOTÓN */}
                <div className="flex justify-end">
                  <Button onClick={() => navigate(`/punto-verde/conciliar/${acta.id}`)} variant="primary">
                    ✓ Conciliar Acta
                  </Button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}