import { useNavigate } from 'react-router-dom';
import NuevaActaForm from '../../components/common/NuevaActaForm';

export default function NuevaActaPage() {
  const navigate = useNavigate();

  const handleSuccess = (numeroActa: string) => {
    console.log(`Acta ${numeroActa} creada exitosamente como Gestor Punto Verde`);
    setTimeout(() => {
      navigate('/gestor-punto-verde/conciliadas');
    }, 2000);
  };

  const handleCancel = () => {
    navigate('/gestor-punto-verde/conciliadas');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NuevaActaForm 
        rol="gestorPuntoVerde"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}