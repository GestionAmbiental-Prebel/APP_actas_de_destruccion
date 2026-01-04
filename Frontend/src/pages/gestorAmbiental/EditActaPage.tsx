import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../../components/common/Button';

export default function EditActaPageGestorAmbiental() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actaData, setActaData] = useState<any>(null);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      // Aquí iría tu llamada API para obtener los datos del acta
      // Ejemplo: const data = await obtenerActaPorId(id);
      setActaData({
        id: id,
        numero_acta: `ACT-${id}`,
        fecha: new Date().toISOString(),
        // ... otros datos
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleCancel = () => {
    navigate('/gestor-ambiental');
  };

  const handleSave = async () => {
    // Aquí iría tu lógica para guardar cambios
    // Ejemplo: await actualizarActa(id, datos);
    alert('Acta actualizada exitosamente');
    navigate('/gestor-ambiental');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-skyBlue mx-auto mb-4"></div>
          <p className="text-xl">Cargando acta #{id}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue">
            Editar Acta #{actaData?.numero_acta}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestor Ambiental - Modo edición
          </p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <span>←</span>
          Volver
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Información del Acta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Acta
              </label>
              <input
                type="text"
                value={actaData?.numero_acta || ''}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={actaData?.fecha ? new Date(actaData.fecha).toISOString().split('T')[0] : ''}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Aquí irían las secciones de identificación, ubicación y residuos */}
        {/* Podrías reutilizar SeccionIdentificacion, SeccionUbicacion, etc. */}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Nota: Esta página es un placeholder. Necesitarás implementar el formulario completo de edición.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              className="px-6 py-3"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              className="px-6 py-3"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}