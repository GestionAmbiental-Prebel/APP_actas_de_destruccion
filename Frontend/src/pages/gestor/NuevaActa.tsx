// src/pages/gestor/NuevaActa.tsx
import { useNavigate } from "react-router-dom";
import { ActaForm, ActaFormData } from "../../components/gestor/ActaForm";

export const NuevaActa = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: ActaFormData) => {
    console.log("Crear acta:", data);
    // Aquí podrías hacer la llamada a API para crear acta
    // Ejemplo: await api.post("/actas", data);

    // Después de crear, volvemos al listado
    navigate("/gestor/actas");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-acidGrotesk">
      
      <ActaForm onSubmit={handleSubmit} />
    </div>
  );
};
