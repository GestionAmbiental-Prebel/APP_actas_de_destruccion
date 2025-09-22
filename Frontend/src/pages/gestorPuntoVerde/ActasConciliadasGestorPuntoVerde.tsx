// src/pages/gestorPuntoVerde/ActasConciliadasGestorPuntoVerde.tsx
import { useState } from "react";

const mockActas = [
  {
    id: 1,
    nombre: "Juan Pérez",
    cedula: "123456789",
    sede: "Medellín",
    area: "Planta A",
    procedencia: "Producción",
    centroCostos: "CC-1001",
    fecha: "2025-01-05",
    conciliada: true,
    conciliacion: {
      nombreConciliador: "Carlos López",
      documento: "456789123",
      pesoConciliado: 12,
      fechaConciliacion: "2025-01-06",
    },
    residuos: [
      { residuo: "Papel", peso: 5 },
      { residuo: "Cartón", peso: 7 },
    ],
  },
  {
    id: 2,
    nombre: "Ana Gómez",
    cedula: "987654321",
    sede: "Bogotá",
    area: "Planta B",
    procedencia: "Logística",
    centroCostos: "CC-2001",
    fecha: "2025-01-12",
    conciliada: false,
    residuos: [
      { residuo: "Plástico", peso: 3 },
      { residuo: "Vidrio", peso: 4 },
    ],
  },
];

export const ActasConciliadasGestorPuntoVerde = () => {
  const [mostrarConciliadas, setMostrarConciliadas] = useState(true);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [numeroActa, setNumeroActa] = useState("");

  const actasFiltradas = mockActas.filter((acta) => {
    if (acta.conciliada !== mostrarConciliadas) return false;

    // Filtro por número de acta
    if (numeroActa && acta.id.toString() !== numeroActa) return false;

    const fechaActa = new Date(acta.fecha);
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta) : null;

    const dentroRango = (!desde || fechaActa >= desde) && (!hasta || fechaActa <= hasta);
    return dentroRango;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 font-acidGrotesk">
      <h2 className="text-2xl font-bold mb-6 text-cyan-700 dark:text-cyan-400 text-center">
        Actas {mostrarConciliadas ? "Conciliadas" : "Pendientes"}
      </h2>

      {/* Toggle Conciliadas/Pendientes */}
      <div className="flex justify-center mb-4 gap-2">
        <button
          onClick={() => setMostrarConciliadas(true)}
          className={`px-4 py-2 rounded ${
            mostrarConciliadas ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Conciliadas
        </button>
        <button
          onClick={() => setMostrarConciliadas(false)}
          className={`px-4 py-2 rounded ${
            !mostrarConciliadas ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          Pendientes
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-cyan-700 dark:text-cyan-400">
            Número de Acta
          </label>
          <input
            type="text"
            placeholder="Ej: 1"
            value={numeroActa}
            onChange={(e) => setNumeroActa(e.target.value)}
            className="w-full p-2 border border-cyan-700 dark:border-cyan-400 rounded bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-cyan-700 dark:text-cyan-400">
            Desde
          </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full p-2 border border-cyan-700 dark:border-cyan-400 rounded bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-cyan-700 dark:text-cyan-400">
            Hasta
          </label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full p-2 border border-cyan-700 dark:border-cyan-400 rounded bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400"
          />
        </div>
      </div>

      {actasFiltradas.length > 0 ? (
        <div className="grid gap-6">
          {actasFiltradas.map((acta) => {
            const totalPeso = acta.residuos?.reduce((acc, r) => acc + r.peso, 0);

            return (
              <div
                key={acta.id}
                className="p-6 border border-cyan-700 dark:border-cyan-400 rounded-lg shadow bg-white dark:bg-gray-800"
              >
                <h3 className="text-lg font-semibold mb-2">Acta #{acta.id}</h3>

                {/* Datos completos del acta */}
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <p><span className="font-semibold">Nombre:</span> {acta.nombre}</p>
                  <p><span className="font-semibold">Cédula:</span> {acta.cedula}</p>
                  <p><span className="font-semibold">Sede:</span> {acta.sede}</p>
                  <p><span className="font-semibold">Área:</span> {acta.area}</p>
                  <p><span className="font-semibold">Procedencia:</span> {acta.procedencia}</p>
                  <p><span className="font-semibold">Centro de Costos:</span> {acta.centroCostos}</p>
                  <p><span className="font-semibold">Fecha Acta:</span> {acta.fecha}</p>
                </div>

                {/* Información de conciliación y resumen de residuos lado a lado */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Resumen de residuos */}
                  {acta.residuos && (
                    <div className="bg-cyan-50 dark:bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-cyan-700 dark:text-cyan-400 mb-2">
                        Resumen de residuos
                      </h4>
                      <ul className="list-disc pl-5 text-sm mb-2">
                        {acta.residuos.map((r, idx) => (
                          <li key={idx}>
                            {r.residuo}: <strong>{r.peso} kg</strong>
                          </li>
                        ))}
                      </ul>
                      <p><span className="font-semibold">Peso total:</span> {totalPeso} kg</p>
                    </div>
                  )}

                  {/* Información del conciliador */}
                  {acta.conciliada && acta.conciliacion && (
                    <div className="bg-cyan-50 dark:bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-cyan-700 dark:text-cyan-400 mb-2">
                        Información de Conciliación
                      </h4>
                      <p><span className="font-semibold">Conciliador:</span> {acta.conciliacion.nombreConciliador}</p>
                      <p><span className="font-semibold">Documento:</span> {acta.conciliacion.documento}</p>
                      <p><span className="font-semibold">Peso conciliado:</span> {acta.conciliacion.pesoConciliado} kg</p>
                      <p><span className="font-semibold">Fecha conciliación:</span> {acta.conciliacion.fechaConciliacion}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          No hay actas {mostrarConciliadas ? "conciliadas" : "pendientes"} en el rango seleccionado.
        </p>
      )}
    </div>
  );
};
