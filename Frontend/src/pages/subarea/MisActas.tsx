import { useState, useEffect, ChangeEvent } from 'react';
import { obtenerActasCompletas } from '../../services/actas.service';
import Button from '../../components/common/Button';

type Residuo = {
  residuo_id: number;
  residuo_nombre: string;
  categoria_nombre: string;
  motivo: string;
  motivo_otro?: string | null;
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
  residuos: Residuo[];
};

export default function MisActas() {
  const [actas, setActas] = useState<Acta[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    cargarActas();
  }, []);

  const cargarActas = async () => {
    try {
      setLoading(true);
      const data = await obtenerActasCompletas();
      setActas(data);
      setError('');
    } catch (err) {
      console.error('Error cargando actas:', err);
      setError('No se pudieron cargar las actas.');
    } finally {
      setLoading(false);
    }
  };

  const filtrarActas = (): Acta[] => {
    return actas.filter((a) => {
      const coincideNumero =
        !busqueda || a.numero_acta.toLowerCase().includes(busqueda.toLowerCase());
      const cumpleFecha =
        (!fechaInicio || new Date(a.fecha_acta) >= new Date(fechaInicio)) &&
        (!fechaFin || new Date(a.fecha_acta) <= new Date(fechaFin));
      return coincideNumero && cumpleFecha;
    });
  };

  const calcularPesoTotal = (residuos: Residuo[]): number => {
    return residuos.reduce((total, r) => {
      const peso = parseFloat(r.peso_reportado) || 0;
      return total + peso;
    }, 0);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFechaInicio('');
    setFechaFin('');
  };

  const actasFiltradas = filtrarActas();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue mb-6">
        Mis Actas
      </h1>

      {/* === FILTROS === */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col flex-1 min-w-[200px]">
            <label className="font-medium mb-1">Buscar por número de acta</label>
            <input
              type="text"
              placeholder="Ej: ACT-2025-12345"
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue focus:outline-none"
              value={busqueda}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Fecha inicio</label>
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue focus:outline-none"
              value={fechaInicio}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaInicio(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Fecha fin</label>
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue focus:outline-none"
              value={fechaFin}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFechaFin(e.target.value)}
            />
          </div>

          <Button onClick={cargarActas} disabled={loading}>
            {loading ? 'Actualizando...' : '🔄 Refrescar'}
          </Button>

          {(busqueda || fechaInicio || fechaFin) && (
            <Button onClick={limpiarFiltros} variant="secondary">
              🗑️ Limpiar filtros
            </Button>
          )}
        </div>

        {/* Contador de resultados */}
        {!loading && actasFiltradas.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Mostrando {actasFiltradas.length} de {actas.length} acta(s)
          </p>
        )}
      </div>

      {/* === LISTADO DE ACTAS === */}
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
              <div
                key={acta.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                {/* Encabezado del Acta */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                      {acta.numero_acta}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      📅 Creada el {new Date(acta.fecha_acta).toLocaleDateString('es-CO', {
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad de residuos</p>
                      <p className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                        {acta.residuos.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos del Operario */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300 flex items-center">
                    👤 Datos del Operario
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cédula</p>
                      <p className="font-semibold">{acta.operario_documento || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                      <p className="font-semibold">{acta.operario_nombre || 'Desconocido'}</p>
                    </div>
                  </div>
                </div>

                {/* Residuos */}
                <div>
                  <h3 className="text-lg font-bold mb-3 text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>♻️ Residuos Registrados</span>
                    <span className="text-base font-normal bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                      Peso Total: {pesoTotal.toFixed(2)} kg
                    </span>
                  </h3>

                  {acta.residuos && acta.residuos.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="p-3 border border-gray-300 dark:border-gray-600 font-semibold">
                              Residuo
                            </th>
                            <th className="p-3 border border-gray-300 dark:border-gray-600 font-semibold">
                              Categoría
                            </th>
                            <th className="p-3 border border-gray-300 dark:border-gray-600 font-semibold">
                              Motivo
                            </th>
                            <th className="p-3 border border-gray-300 dark:border-gray-600 font-semibold text-right">
                              Peso (kg)
                            </th>
                            <th className="p-3 border border-gray-300 dark:border-gray-600 font-semibold">
                              Fecha
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {acta.residuos.map((r, i) => (
                            <tr 
                              key={i} 
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <td className="p-3 border border-gray-300 dark:border-gray-600">
                                {r.residuo_nombre}
                              </td>
                              <td className="p-3 border border-gray-300 dark:border-gray-600">
                                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                                  {r.categoria_nombre}
                                </span>
                              </td>
                              <td className="p-3 border border-gray-300 dark:border-gray-600">
                                {r.motivo === 'Otra' && r.motivo_otro
                                  ? `Otro: ${r.motivo_otro}`
                                  : r.motivo}
                              </td>
                              <td className="p-3 border border-gray-300 dark:border-gray-600 text-right font-semibold">
                                {parseFloat(r.peso_reportado).toFixed(2)}
                              </td>
                              <td className="p-3 border border-gray-300 dark:border-gray-600">
                                {new Date(r.fecha).toLocaleDateString('es-CO')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      No hay residuos registrados en esta acta.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}