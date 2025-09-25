// src/pages/operario/ActasOperario.tsx

import { useUser } from "../../context/UserContext";
import ListaActas from "../../components/operario/ListaActas";

// 🔹 Datos mock
const mockActas = [
  {
    id: 1,
    nombre: "Juan Pérez",
    cedula: "123456789",
    sede: "Medellín",
    procedencia: "Producción",
    area: "Planta A",
    centroCostos: "CC-1001",
    fecha: "2025-01-05",
    residuos: [
      { residuo: "Papel", categoria: "Reciclable", motivo: "Documentos obsoletos", peso: "5" },
      { residuo: "Cartón", categoria: "Reciclable", motivo: "Cajas dañadas", peso: "8" },
    ],
  },
  {
    id: 2,
    nombre: "Ana Gómez",
    cedula: "987654321",
    sede: "Bogotá",
    procedencia: "Logística",
    area: "Planta B",
    centroCostos: "CC-2001",
    fecha: "2025-01-12",
    residuos: [
      { residuo: "Plástico", categoria: "Reciclable", motivo: "Envases rotos", peso: "3" },
    ],
  },
];

export default function ActasOperario() {
  const { user } = useUser();

  // Filtramos solo las actas de su área
  const actasUsuario = mockActas.filter((acta) => acta.area === user.area);

  return (
    <div className="max-w-6xl mx-auto p-6 font-acidGrotesk">
      <h1 className="text-3xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        Mis Actas - {user.area}
      </h1>

      {actasUsuario.length > 0 ? (
        <ListaActas actas={actasUsuario} />
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          No se encontraron actas para tu área.
        </p>
      )}
    </div>
  );
}
