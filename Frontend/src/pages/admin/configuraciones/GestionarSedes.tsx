// src/pages/admin/Sedes.tsx
import { useState } from "react";

export const GestionarSedes = () => {
  const [sedes, setSedes] = useState(["Bogotá", "Medellín"]);

  return (
    <div className="p-6 font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-cyan-700 dark:text-cyan-400">
        Gestionar Sedes
      </h2>

      <ul className="space-y-2">
        {sedes.map((sede) => (
          <li
            key={sede}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition flex justify-between items-center"
          >
            <span>{sede}</span>
            <button className="text-red-500 hover:text-red-700">Eliminar</button>
          </li>
        ))}
      </ul>

      <button className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">
        ➕ Agregar Sede
      </button>
    </div>
  );
};
