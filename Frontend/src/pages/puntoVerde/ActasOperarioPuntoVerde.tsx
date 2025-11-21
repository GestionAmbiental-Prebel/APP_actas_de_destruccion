import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerActasCompletas } from '../../services/actas.service';
import Button from '../../components/common/Button';
import { useFiltroActas } from '../../hooks/use.FilteredDateActas';
import FilteredDateActas from '../../components/common/FilteredDateActas';

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
  fecha_acta: string;
  operario_nombre: string;
  operario_documento: string;
  centro_costo_id: number;
  residuos: Residuo[];
  documento_recepcion?: string; // para filtrar pendientes
};

export default function ActasOperarioPuntoVerde() {
  const [actas, setActas] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(false);
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
  "operario_documento"
]);


  useEffect(() => {
    cargarActas();
  }, []);

  const cargarActas = async () => {
    try {
      setLoading(true);
      const data = await obtenerActasCompletas();
      const pendientes = data.filter(a => !a.documento_recepcion); // solo pendientes
      setActas(pendientes);
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

  const actasFiltradas = filtrar();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue mb-6">
        Actas para Conciliar - Punto Verde
      </h1>

      {/* Filtros reutilizables */}
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

      {/* Listado */}
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
                {/* Header */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                      {acta.numero_acta}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      📅 {new Date(acta.fecha_acta).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="bg-skyBlue/10 dark:bg-lightBlue/10 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Residuos</p>
                      <p className="text-2xl font-bold text-skyBlue dark:text-lightBlue">{acta.residuos.length}</p>
                    </div>
                  </div>
                </div>

                {/* Datos del operario */}
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

                {/* Residuos */}
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
                          <th className="p-3 border border-gray-300 dark:border-gray-600">Residuo</th>
                          <th className="p-3 border border-gray-300 dark:border-gray-600">Categoría</th>
                          <th className="p-3 border border-gray-300 dark:border-gray-600">Motivo</th>
                          <th className="p-3 border border-gray-300 dark:border-gray-600 text-right">Peso (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acta.residuos.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-3 border border-gray-300 dark:border-gray-600">
                              {r.residuo_nombre === 'Otro' && r.residuo_otro ? `Otro: ${r.residuo_otro}` : r.residuo_nombre}
                            </td>
                            <td className="p-3 border border-gray-300 dark:border-gray-600">
                              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                                {r.categoria_nombre}
                              </span>
                            </td>
                            <td className="p-3 border border-gray-300 dark:border-gray-600">
                              {r.motivo === 'Otro' && r.motivo_otro ? `Otro: ${r.motivo_otro}` : r.motivo}
                            </td>
                            <td className="p-3 border border-gray-300 dark:border-gray-600 text-right font-semibold">
                              {parseFloat(r.peso_reportado).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Botón Conciliar */}
                <div className="flex justify-end">
                  <Button onClick={() => navigate(`/operario-punto-verde/conciliar/${acta.id}`)} variant="primary">
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
