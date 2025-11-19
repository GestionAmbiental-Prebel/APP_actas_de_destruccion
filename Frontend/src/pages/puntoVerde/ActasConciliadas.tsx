import { useState, useEffect } from 'react';
import { obtenerActasConciliadas } from '../../services/actas.service';
import SectionTitle from '../../components/common/SectionTitle';
import Button from '../../components/common/Button';

type ResiduoConciliado = {
  residuo_nombre: string;
  categoria_nombre: string;
  motivo: string;
  motivo_otro?: string | null;
  peso_reportado: number;
  peso_conciliado: number;
  fecha: string;
  fecha_conciliacion?: string;
};

type ActaConciliada = {
  id: number;
  numero_acta: string;
  fecha_acta: string;
  operario_nombre: string;
  operario_documento: string;
  documento_recepcion: string;
  peso_total_reportado: number;
  peso_total_conciliado: number;
  residuos: ResiduoConciliado[];
};

export default function ActasConciliadas() {
  const [actas, setActas] = useState<ActaConciliada[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalActa, setModalActa] = useState<ActaConciliada | null>(null);

  useEffect(() => {
    cargarActas();
  }, []);

  const cargarActas = async () => {
    try {
      setLoading(true);
      const data = await obtenerActasConciliadas();

      // Convertir los pesos a número
      const actasConPesosNumericos = data.map((acta: any) => ({
        ...acta,
        peso_total_reportado: Number(acta.peso_total_reportado),
        peso_total_conciliado: Number(acta.peso_total_conciliado),
        residuos: acta.residuos.map((r: any) => ({
          ...r,
          peso_reportado: Number(r.peso_reportado),
          peso_conciliado: Number(r.peso_conciliado),
        })),
      }));

      setActas(actasConPesosNumericos);
    } catch (error) {
      console.error('Error cargando actas conciliadas:', error);
      alert('Error al cargar las actas conciliadas');
    } finally {
      setLoading(false);
    }
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

  if (actas.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-500">No hay actas conciliadas todavía.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-skyBlue dark:text-lightBlue">
        Actas Conciliadas
      </h1>

      <div className="space-y-4">
        {actas.map((acta) => {
          const diferencia = acta.peso_total_conciliado - acta.peso_total_reportado;
          return (
            <div
              key={acta.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                  {acta.numero_acta}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(acta.fecha_acta).toLocaleDateString('es-CO')}
                </p>
              </div>

              <p className="text-gray-700 dark:text-gray-300">
                Entregado por: {acta.operario_nombre} ({acta.operario_documento})
              </p>
              
              <p className="text-gray-700 dark:text-gray-300">
                Recibido por: {acta.documento_recepcion}
              </p>

              <div className="flex gap-4 mt-2">
                <p className="font-semibold text-blue-600 dark:text-blue-400">
                  Peso Reportado: {acta.peso_total_reportado.toFixed(2)} kg
                </p>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  Peso Conciliado: {acta.peso_total_conciliado.toFixed(2)} kg
                </p>
              </div>

              {diferencia !== 0 && (
                <div
                  className={`mt-2 p-2 rounded ${
                    diferencia > 0
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  Diferencia: {diferencia > 0 ? '+' : ''}
                  {diferencia.toFixed(2)} kg
                </div>
              )}

              <div className="mt-3 flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setModalActa(acta)}
                >
                  Ver Detalles
                </Button>
              </div>
            </div>
          );
        })}
      </div>

  {/* Modal de detalles */}
{modalActa && (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
      <h2 className="text-xl font-bold mb-2">{modalActa.numero_acta} - Detalles</h2>

      {/* Fecha y hora de conciliación */}
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Fecha y hora de conciliación:{' '}
        {modalActa.residuos.length > 0 && modalActa.residuos[0].fecha
          ? new Date(modalActa.residuos[0].fecha).toLocaleString('es-CO')
          : 'No disponible'}
      </p>

      <p className="mb-2">Entregado por: {modalActa.operario_nombre} ({modalActa.operario_documento})</p>
      <p className="mb-2">Recibido por: {modalActa.documento_recepcion}</p>

      <div className="overflow-y-auto max-h-96">
        <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border px-2 py-1">Residuo</th>
              <th className="border px-2 py-1">Categoría</th>
              <th className="border px-2 py-1">Motivo</th>
              <th className="border px-2 py-1">Peso Reportado</th>
              <th className="border px-2 py-1">Peso Conciliado</th>
            </tr>
          </thead>
          <tbody>
            {modalActa.residuos.map((r, idx) => (
              <tr key={idx} className="text-center">
                <td className="border px-2 py-1">{r.residuo_nombre}</td>
                <td className="border px-2 py-1">{r.categoria_nombre}</td>
                <td className="border px-2 py-1">{r.motivo}{r.motivo_otro ? ` (${r.motivo_otro})` : ''}</td>
                <td className="border px-2 py-1">{r.peso_reportado.toFixed(2)}</td>
                <td className="border px-2 py-1">{r.peso_conciliado?.toFixed(2) ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={() => setModalActa(null)}>
          Cerrar
        </Button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}
