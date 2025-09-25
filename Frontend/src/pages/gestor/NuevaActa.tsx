// src/pages/gestor/NuevaActa.tsx
import { useNavigate } from "react-router-dom";
import { ActaCrud, ActaFormData } from "../../components/gestor/ActaCrud";

export const NuevaActa = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: ActaFormData) => {
    console.log("Crear acta (API):", data);
    // await api.post("/actas", data);
    // navegación posterior la maneja onSaved
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-acidGrotesk">
      <ActaCrud
        onSubmit={handleSubmit}
        // si tu app tiene el perfil del usuario en sesión, pásalo aquí:
        // userPerfil={auth.user.perfil}
        onSaved={() => navigate("/gestor/actas")}
      />
    </div>
  );
};
