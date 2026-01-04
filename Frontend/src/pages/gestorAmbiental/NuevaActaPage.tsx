import { useNavigate } from 'react-router-dom';
import NuevaActaForm from '../../components/common/NuevaActaForm';

export default function NuevaActaPageGestorAmbiental() {
  const navigate = useNavigate();

  const handleSuccess = (numeroActa: string) => {
    console.log(`Acta ${numeroActa} creada exitosamente como Gestor Ambiental`);
    // Opción 1: Navegar de vuelta a la lista
    // navigate('/gestor-ambiental');
    
    // Opción 2: Mostrar mensaje y luego navegar después de unos segundos
    setTimeout(() => {
      navigate('/gestor-ambiental');
    }, 3000);
  };

  const handleCancel = () => {
    // Regresar a la página principal del gestor ambiental
    navigate('/gestor-ambiental');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NuevaActaForm 
        rol="gestorAmbiental"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}