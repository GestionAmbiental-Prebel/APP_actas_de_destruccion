// src/pages/puntoVerde/ActasOperarioPuntoVerde.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      {
        residuo: "Papel",
        categoria: "Reciclable",
        motivo: "Documentos obsoletos",
        peso: "5",
      },
      {
        residuo: "Cartón",
        categoria: "Reciclable",
        motivo: "Cajas dañadas",
        peso: "8",
      },
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
      {
        residuo: "Plástico",
        categoria: "Reciclable",
        motivo: "Envases rotos",
        peso: "3",
      },
    ],
  },
];

export const ActasOperarioPuntoVerde = () => {
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const navigate = useNavigate();

  // 🔹 Filtrar actas por residuo y fechas
  const actasFiltradas = mockActas.filter((acta) => {
    const matchResiduo = acta.residuos.some((r) =>
      r.residuo.toLowerCase().includes(busqueda.toLowerCase())
    );

    const fechaActa = new Date(acta.fecha).getTime();
    const fechaDesde = desde ? new Date(desde).getTime() : null;
    const fechaHasta = hasta ? new Date(hasta).getTime() : null;

    const matchDesde = fechaDesde ? fechaActa >= fechaDesde : true;
    const matchHasta = fechaHasta ? fechaActa <= fechaHasta : true;

    return matchResiduo && matchDesde && matchHasta;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 font-acidGrotesk">
      <h2 className="text-2xl font-bold mb-6 text-green-700 dark:text-green-400 text-center">
        Actas Punto Verde
      </h2>

      {/* Filtros */}
      <div className="bg-green-100 dark:bg-gray-800 p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 items-end gap-4">
        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs font-medium mb-1 text-green-700 dark:text-green-400">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Buscar por residuo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-2 border border-green-700 dark:border-green-400 rounded bg-white dark:bg-gray-700 text-green-700 dark:text-green-400 placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-green-700 dark:text-green-400">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="p-2 border border-green-700 dark:border-green-400 rounded bg-white dark:bg-gray-700 text-green-700 dark:text-green-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-green-700 dark:text-green-400">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="p-2 border border-green-700 dark:border-green-400 rounded bg-white dark:bg-gray-700 text-green-700 dark:text-green-400"
          />
        </div>
      </div>

      {/* Listado */}
      {actasFiltradas.length > 0 ? (
        <div className="grid gap-6">
          {actasFiltradas.map((acta) => {
            // 🔹 Calcular total de peso
            const totalPeso = acta.residuos.reduce(
              (acc, r) => acc + Number(r.peso || 0),
              0
            );

            return (
              <div
                key={acta.id}
                className="p-6 border border-green-700 dark:border-green-400 rounded-lg shadow bg-white dark:bg-gray-800"
              >
                {/* Header de la tarjeta */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-green-300">
                    Acta #{acta.id}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    {acta.fecha}
                  </span>
                </div>

                {/* Datos generales */}
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <p>
                    <span className="font-semibold">Nombre:</span>{" "}
                    {acta.nombre}
                  </p>
                  <p>
                    <span className="font-semibold">Cédula:</span>{" "}
                    {acta.cedula}
                  </p>
                  <p>
                    <span className="font-semibold">Sede:</span> {acta.sede}
                  </p>
                  <p>
                    <span className="font-semibold">Área:</span> {acta.area}
                  </p>
                  <p>
                    <span className="font-semibold">Procedencia:</span>{" "}
                    {acta.procedencia}
                  </p>
                  <p>
                    <span className="font-semibold">Centro de Costos:</span>{" "}
                    {acta.centroCostos}
                  </p>
                </div>

                {/* Residuos */}
                <div>
                  <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                    Residuos registrados:
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-green-700 dark:border-green-400 rounded-lg">
                      <thead className="bg-green-100 dark:bg-gray-700">
                        <tr>
                          <th className="p-2 text-left">Residuo</th>
                          <th className="p-2 text-left">Categoría</th>
                          <th className="p-2 text-left">Motivo</th>
                          <th className="p-2 text-left">Peso (kg)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acta.residuos.map((r, idx) => (
                          <tr
                            key={idx}
                            className="border-t border-green-700/30 dark:border-green-400/30"
                          >
                            <td className="p-2">{r.residuo}</td>
                            <td className="p-2">{r.categoria}</td>
                            <td className="p-2">{r.motivo}</td>
                            <td className="p-2">{r.peso}</td>
                          </tr>
                        ))}

                        {/* 🔹 Total de peso */}
                        <tr className="font-semibold bg-green-50 dark:bg-gray-700">
                          <td colSpan={3} className="p-2 text-right">
                            Total peso:
                          </td>
                          <td className="p-2">{totalPeso} kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 🔹 Botón Conciliar */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() =>
                      navigate(`/operario-punto-verde/conciliar/${acta.id}`)
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Conciliar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          No se encontraron actas con los filtros aplicados.
        </p>
      )}
    </div>
  );
};
