import React from "react";

interface Acta {
  id: number;
  nombre: string;
  cedula: string;
  sede: string;
  procedencia: string;
  area: string;
  centroCostos: string;
  fecha: string;
  residuos: {
    residuo: string;
    categoria: string;
    motivo: string;
    peso: string;
  }[];
}

interface ActasListProps {
  actas: Acta[];
}

export default function ActasList({ actas }: ActasListProps) {
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl font-acidGrotesk">
      <h2 className="text-2xl font-bold mb-6 text-sky-700 dark:text-sky-400 text-center">
        Actas Registradas
      </h2>

      {actas.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300">
          No hay actas registradas aún.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden">
            <thead className="bg-sky-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Cédula</th>
                <th className="px-4 py-3 text-left">Centro de Costos</th>
                <th className="px-4 py-3 text-left">Procedencia</th>
                <th className="px-4 py-3 text-left">Sede</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left"># Residuos</th>
              </tr>
            </thead>
            <tbody>
              {actas.map((acta, index) => (
                <tr
                  key={acta.id}
                  className={`border-t dark:border-gray-700 ${
                    index % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-900"
                      : "bg-white dark:bg-gray-800"
                  }`}
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{acta.nombre}</td>
                  <td className="px-4 py-3">{acta.cedula}</td>
                  <td className="px-4 py-3">{acta.centroCostos}</td>
                  <td className="px-4 py-3">{acta.procedencia}</td>
                  <td className="px-4 py-3">{acta.sede}</td>
                  <td className="px-4 py-3">
                    {new Date(acta.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {acta.residuos.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
