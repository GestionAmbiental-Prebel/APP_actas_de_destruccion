// src/pages/gestor/EditarActa.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ActaCrud, ActaFormData } from "../../components/gestor/ActaCrud";

const mockActas = [
  {
    id: "1",
    nombre: "Juan",
    apellido: "Pérez",
    cedula: "123456789",
    perfil: "administrativo",
    sede: "Bogotá",
    procedencia: "Oficina Central",
    area: "Finanzas",
    centroCostos: "Contabilidad",
    categoria: "reciclable",
    residuo: "Papelería",
    motivo: "Vencimiento",
    fecha: "2025-01-05",
  },
  // ...
];

export const EditarActa = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const acta = mockActas.find((a) => a.id === id);

  if (!acta) return <p className="text-center mt-6">Acta no encontrada</p>;

  const handleSubmit = async (data: ActaFormData) => {
    console.log("Actualizar acta (API):", data);
    // await api.put(`/actas/${id}`, data); // ejemplo
    // NO navegamos aquí: la navegación se hace en onSaved pasada a ActaCrud
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-acidGrotesk">
      <ActaCrud
        initialData={acta}
        userPerfil={acta.perfil} // aquí le pasamos el perfil detectado para poblar selects
        onSubmit={handleSubmit}
        onSaved={() => navigate("/gestor/actas")} // se ejecuta después del toast
      />
    </div>
  );
};
