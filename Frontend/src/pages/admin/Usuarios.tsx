// src/pages/admin/Usuarios.tsx
import { Link } from "react-router-dom";
import { useState } from "react";

interface SubArea {
  id: number;
  nombre: string;
  rol: string; // puedes cambiar "rol" por "tipo" si prefieres
}

export const Usuarios = () => {
  const [subAreas, setSubAreas] = useState<SubArea[]>([
    { id: 1, nombre: "Producción", rol: "Operario" },
    { id: 2, nombre: "Logística", rol: "Gestor" },
    { id: 3, nombre: "Finanzas", rol: "Administrador" },
  ]);

  const eliminarSubArea = (id: number) => {
    if (confirm("¿Seguro que quieres eliminar esta subárea?")) {
      setSubAreas(subAreas.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="p-6 font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-cyan-700 dark:text-cyan-400">
        Gestión de Subáreas
      </h2>

      {/* Botón agregar */}
      <div className="mb-6">
        <Link to="/admin/usuarios/nuevo">
          <button className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold rounded-xl shadow hover:scale-105 transition">
            + Nueva Subárea
          </button>
        </Link>
      </div>

      {/* Tabla de subáreas */}
      <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gradient-to-r from-cyan-700 to-blue-600 text-white">
            <tr>
              <th className="p-3">Nombre de la Subárea</th>
              <th className="p-3">Rol</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {subAreas.map((subArea, index) => (
              <tr
                key={subArea.id}
                className={`${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-900"
                } hover:bg-cyan-50 dark:hover:bg-gray-700 transition`}
              >
                <td className="p-3 font-medium text-gray-800 dark:text-gray-200">
                  {subArea.nombre}
                </td>
                <td className="p-3 text-gray-600 dark:text-gray-300">
                  {subArea.rol}
                </td>
                <td className="p-3 text-center flex justify-center gap-2">
                  <Link to={`/admin/usuarios/editar/${subArea.id}`}>
                    <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 shadow">
                      Editar
                    </button>
                  </Link>
                  <button
                    onClick={() => eliminarSubArea(subArea.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 shadow"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {subAreas.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No hay subáreas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
