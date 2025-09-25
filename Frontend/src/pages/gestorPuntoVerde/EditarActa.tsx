// src/pages/gestorPuntoVerde/EditarActa.tsx
import { useParams, useNavigate } from "react-router-dom";
import { ActaCrud, ActaFormData } from "../../components/gestor/ActaCrud";


// Datos de ejemplo para gestor punto verde
const mockActasPV = [
  {
    id: "1",
    nombre: "Carlos López",
    cedula: "1122334455",
    perfil: "gestorPV",
    sede: "Medellín",
    procedencia: "Producción",
    area: "Planta Verde",
    centroCostos: "CC-3001",
    categoria: "Reciclable",
    residuo: "Vidrio",
    motivo: "Exceso de inventario",
    fecha: "2025-02-10",
  },
  {
    id: "2",
    nombre: "Laura Martínez",
    cedula: "9988776655",
    perfil: "gestorPV",
    sede: "Bogotá",
    procedencia: "Logística",
    area: "Planta Verde B",
    centroCostos: "CC-4001",
    categoria: "Orgánico",
    residuo: "Cartón",
    motivo: "Documentos obsoletos",
    fecha: "2025-02-12",
  },
];

export const EditarActaPV = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const acta = mockActasPV.find((a) => a.id === id);

  if (!acta) return <p className="text-center mt-6">Acta no encontrada</p>;

  const handleSubmit = (data: ActaFormData) => {
    console.log("Actualizar acta (PV):", data);
    // Llamada API para actualizar acta
    navigate("/gestor-pv/actas");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-acidGrotesk">
      <ActaCrud initialData={acta} onSubmit={handleSubmit} />
    </div>
  );
};
