// src/pages/gestorPuntoVerde/NuevaActa.tsx
import { useNavigate } from "react-router-dom";
import { ActaCrud,  ActaFormData } from "../../components/gestor/ActaCrud";

export const NuevaActaPV = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: ActaFormData) => {
    console.log("Crear acta (PV):", data);
    // Llamada API para crear acta
    navigate("/gestor-pv/actas");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-acidGrotesk">
      <ActaCrud onSubmit={handleSubmit} />
    </div>
  );
};
