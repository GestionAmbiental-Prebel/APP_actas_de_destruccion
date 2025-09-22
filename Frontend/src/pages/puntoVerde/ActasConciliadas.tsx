// src/pages/puntoVerde/ActasConciliadas.tsx
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
    conciliada: true,
    conciliacion: {
      nombreConciliador: "María Ruiz",
      documento: "789654123",
      pesoConciliado: 9,
      fechaConciliacion: "2025-01-13",
    },
    residuos: [
      { residuo: "Plástico", peso: 4 },
      { residuo: "Vidrio", peso: 5 },
    ],
  },
];

export const ActasConciliadas = () => {
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const actasConciliadas = mockActas.filter((acta) => {
    if (!acta.conciliada) return false;

    const coincideBusqueda =
      acta.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      acta.cedula.includes(busqueda);

    const fechaActa = new Date(acta.fecha);
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta) : null;

    const dentroRango =
      (!desde || fechaActa >= desde) && (!hasta || fechaActa <= hasta);

    return coincideBusqueda && dentroRango;
  });

  return (
    <div className="max-w-5xl mx-auto p-6 font-acidGrotesk">
      <h2 className="text-2xl font-bold mb-6 text-cyan-700 dark:text-cyan-400 text-center">
        Actas Conciliadas
      </h2>

      {/* Filtros */}
      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-cyan-700 dark:text-cyan-400">Buscar</label>
          <input
            type="text"
            placeholder="Nombre o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-2 border border-cyan-700 dark:border-cyan-400 rounded bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-cyan-700 dark:text-cyan-400">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full p-2 border border-cyan-700 dark:border-cyan-400 rounded bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-cyan-700 dark:text-cyan-400">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full p-2 border border-cyan-700 dark:border-cyan-400 rounded bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400"
          />
        </div>
      </div>

      {actasConciliadas.length > 0 ? (
        <div className="grid gap-6">
          {actasConciliadas.map((acta) => {
            const totalPeso = acta.residuos?.reduce((acc, r) => acc + r.peso, 0);

            return (
              <div
                key={acta.id}
                className="p-6 border border-cyan-700 dark:border-cyan-400 rounded-lg shadow bg-white dark:bg-gray-800"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-cyan-300">
                    Acta #{acta.id}
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-700/30 dark:text-cyan-300">
                    Conciliada ✅
                  </span>
                </div>

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

                {/* Modo espejo: conciliación y residuos */}
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  {/* Información de conciliación */}
                  {acta.conciliacion && (
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

                  {/* Resumen residuos */}
                  {acta.residuos && (
                    <div className="bg-cyan-50 dark:bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-cyan-700 dark:text-cyan-400 mb-2">
                        Resumen de residuos
                      </h4>
                      <ul className="list-disc pl-5 text-sm mb-2">
                        {acta.residuos.map((r, idx) => (
                          <li key={idx}>{r.residuo}: <strong>{r.peso} kg</strong></li>
                        ))}
                      </ul>
                      <p><span className="font-semibold">Peso total:</span> {totalPeso} kg</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          No hay actas conciliadas en el rango seleccionado.
        </p>
      )}
    </div>
  );
};
