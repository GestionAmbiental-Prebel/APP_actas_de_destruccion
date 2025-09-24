// src/components/operario/ListaActas.tsx
import { useState } from "react";

// 🔹 Tipos
interface Residuo {
  residuo: string;
  categoria: string;
  motivo: string;
  peso: string;
}

interface Acta {
  id: number;
  nombre: string;
  cedula: string;
  sede: string;
  procedencia: string;
  area: string;
  centroCostos: string;
  fecha: string;
  residuos: Residuo[];
}

interface ListaActasProps {
  actas: Acta[];
}

export default function ListaActas({ actas }: ListaActasProps) {
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // 🔹 Filtrado de actas
  const actasFiltradas = actas.filter((acta) => {
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
      <h2 className="text-2xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        Mis Actas
      </h2>

      {/* 🔹 Filtros */}
      <div className="bg-lightBlue/10 dark:bg-gray-800 p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 items-end gap-4">
        <div className="md:col-span-2 flex flex-col">
          <label className="text-xs font-medium mb-1 text-skyBlue dark:text-lightBlue">
            Buscar por residuo
          </label>
          <input
            type="text"
            placeholder="Ej: Papel, Plástico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-2 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-700 text-skyBlue dark:text-lightBlue placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-skyBlue dark:text-lightBlue">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="p-2 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-700 text-skyBlue dark:text-lightBlue"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-medium mb-1 text-skyBlue dark:text-lightBlue">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="p-2 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-700 text-skyBlue dark:text-lightBlue"
          />
        </div>
      </div>

      {/*Listado */}
      {actasFiltradas.length > 0 ? (
        <div className="grid gap-6">
          {actasFiltradas.map((acta) => {
            const totalPeso = acta.residuos.reduce(
              (acc, r) => acc + Number(r.peso || 0),
              0
            );

            return (
              <div
                key={acta.id}
                className="p-6 border border-skyBlue dark:border-lightBlue rounded-lg shadow bg-white dark:bg-gray-800"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-lightBlue">
                    Acta #{acta.id}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-300">
                    {acta.fecha}
                  </span>
                </div>

                {/* Datos generales */}
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <p>
                    <span className="font-semibold">Nombre:</span> {acta.nombre}
                  </p>
                  <p>
                    <span className="font-semibold">Cédula:</span> {acta.cedula}
                  </p>
                  <p>
                    <span className="font-semibold">Sede:</span> {acta.sede}
                  </p>
                  <p>
                    <span className="font-semibold">Área:</span> {acta.area}
                  </p>
                  <p>
                    <span className="font-semibold">Sub Área:</span>{" "}
                    {acta.procedencia}
                  </p>
                  <p>
                    <span className="font-semibold">Centro de Costos:</span>{" "}
                    {acta.centroCostos}
                  </p>
                </div>

                {/* Residuos */}
                <div>
                  <h4 className="font-semibold mb-2 text-skyBlue dark:text-lightBlue">
                    Residuos registrados
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-skyBlue dark:border-lightBlue rounded-lg">
                      <thead className="bg-lightBlue/20 dark:bg-gray-700">
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
                            className="border-t border-skyBlue/30 dark:border-lightBlue/30"
                          >
                            <td className="p-2">{r.residuo}</td>
                            <td className="p-2">{r.categoria}</td>
                            <td className="p-2">{r.motivo}</td>
                            <td className="p-2">{r.peso}</td>
                          </tr>
                        ))}
                        <tr className="font-semibold bg-lightBlue/10 dark:bg-gray-700">
                          <td colSpan={3} className="p-2 text-right">
                            Total peso:
                          </td>
                          <td className="p-2">{totalPeso} kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
}
