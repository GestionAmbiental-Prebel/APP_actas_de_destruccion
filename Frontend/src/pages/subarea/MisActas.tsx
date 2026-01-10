import { useState, useEffect } from 'react';
import { obtenerActasCompletas } from '../../services/actas.service';
import { useFiltroActas } from '../../hooks/use.FilteredDateActas';
import { sortByDateDesc } from "../../utils/sortByDate";
import FilteredDateActas from '../../components/common/FilteredDateActas';

type Residuo = {
  residuo_id: number;
  residuo_nombre: string;
  categoria_nombre: string;
  motivo: string;
  motivo_otro?: string | null;
  residuo_otro?: string | null;
  peso_reportado: string;
  fecha: string;
};

type Acta = {
  id: number;
  numero_acta: string;
  fecha_acta: string;
  operario_nombre: string;
  operario_documento: string;
  centro_costo_id: number;
  consecutivo?: string;
  numero_inventario?: string;
  residuos: Residuo[];
};

export default function MisActas() {
  const [actas, setActas] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    busqueda,
    setBusqueda,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    filtrar,
    limpiarFiltros
  } = useFiltroActas<Acta>(actas, [
    "numero_acta",
    "operario_nombre",
    "operario_documento",
    "numero_inventario",
    "consecutivo"
  ]);

  useEffect(() => {
    cargarActas();
  }, []);

  const cargarActas = async () => {
    try {
      setLoading(true);
      const data = await obtenerActasCompletas();
      setActas(sortByDateDesc(data, "fecha_acta"));
      setError('');
    } catch (err) {
      console.error('Error cargando actas:', err);
      setError('No se pudieron cargar las actas.');
    } finally {
      setLoading(false);
    }
  };

  const calcularPesoTotal = (residuos: Residuo[]): number =>
    residuos.reduce((total, r) => total + (parseFloat(r.peso_reportado) || 0), 0);

  // Función para determinar el tipo de residuo
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

  // Función para formatear la fecha
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

  const actasFiltradas = sortByDateDesc(filtrar(), "fecha_acta");

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue mb-6">
        Mis Actas
      </h1>

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
          {actasFiltradas.map((acta: Acta) => {
            const pesoTotal = calcularPesoTotal(acta.residuos);

            return (
              <div
                key={acta.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {/* ENCABEZADO */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                      {acta.numero_acta}
                    </h2>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                      {acta.consecutivo && <p>Consecutivo: {acta.consecutivo}</p>}
                      {acta.numero_inventario && <p>Número de Inventario: {acta.numero_inventario}</p>}
                      <p>
                        📅 Creada el{' '}
                        {new Date(acta.fecha_acta).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="bg-skyBlue/10 dark:bg-lightBlue/10 px-4 py-2 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad de residuos</p>
                    <p className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                      {acta.residuos.length}
                    </p>
                  </div>
                </div>

                {/* OPERARIO */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300">
                    👤 Datos del Operario
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

                {/* RESIDUOS */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300 flex justify-between">
                    <span>♻️ Residuos Registrados</span>
                    <span className="text-base bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
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
                        {acta.residuos.map((r: Residuo, i: number) => {
                          const infoResiduo = obtenerInfoResiduo(r);
                          
                          return (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                              {/* RESIDUO */}
                              <td className="p-3 border">
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

                              {/* DETALLE */}
                              <td className="p-3 border">
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

                              {/* MOTIVO */}
                              <td className="p-3 border">
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

                              {/* PESO */}
                              <td className="p-3 border text-right">
                                <div className="font-bold text-lg text-gray-900 dark:text-white">
                                  {parseFloat(r.peso_reportado).toFixed(2)}
                                </div>
                              </td>

                              {/* FECHA - MEJORADA */}
                              <td className="p-3 border">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}