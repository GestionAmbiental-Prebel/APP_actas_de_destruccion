// src/pages/gestor/EditarActa.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ActaForm, ActaFormData } from "../../components/gestor/ActaForm";

// Datos de ejemplo (simulando lo que vendría de la API)
const mockActas = [
  {
    id: "1",
    nombre: "Juan Pérez",
    cedula: "123456789",
    perfil: "gestor",
    sede: "Medellín",
    procedencia: "Producción",
    area: "Planta A",
    centroCostos: "CC-1001",
    categoria: "Reciclable",
    residuo: "Papel",
    motivo: "Documentos obsoletos",
    fecha: "2025-01-05",
  },
  {
    id: "2",
    nombre: "Ana Gómez",
    cedula: "987654321",
    perfil: "operario",
    sede: "Bogotá",
    procedencia: "Logística",
    area: "Planta B",
    centroCostos: "CC-2001",
    categoria: "Orgánico",
    residuo: "Cartón",
    motivo: "Embalajes dañados",
    fecha: "2025-01-12",
  },
];

export const EditarActa = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Buscar acta por id
  const acta = mockActas.find((a) => a.id === id);

  if (!acta) return <p className="text-center mt-6">Acta no encontrada</p>;

  const handleSubmit = (data: ActaFormData) => {
    console.log("Actualizar acta:", data);
    // Aquí podrías hacer la llamada a API para actualizar acta
    // Ejemplo: await api.put(`/actas/${id}`, data);

    // Después de editar, volvemos al listado
    navigate("/gestor/actas");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        Editar Acta
      </h2>
      <ActaForm initialData={acta} onSubmit={handleSubmit} />
    </div>
  );
};
