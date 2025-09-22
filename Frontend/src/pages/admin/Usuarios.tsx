// src/pages/admin/Usuarios.tsx

import { Link } from "react-router-dom";


export const Usuarios = () => {
  return (
    <div className="p-6 font-acidGrotesk">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700 dark:text-cyan-400">
        Gestión de Usuarios
      </h2>

      {/* Botón agregar */}
        <Link to="/admin/nuevo-usuario">
        <button className="mb-4 px-4 py-2 bg-cyan-700 text-white rounded hover:bg-cyan-600">
        + Nuevo Usuario
        </button>
        </Link>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Correo</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">Juan Pérez</td>
              <td className="p-2 border">juan@example.com</td>
              <td className="p-2 border">Gestor</td>
              <td className="p-2 border flex gap-2">
                <button className="px-2 py-1 bg-blue-500 text-white rounded">Editar</button>
                <button className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
