// src/pages/admin/Usuarios.tsx
import { Link } from "react-router-dom";
import { useState } from "react";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: 1, nombre: "Juan Pérez", email: "juan@example.com", rol: "Gestor" },
    { id: 2, nombre: "Ana Gómez", email: "ana@example.com", rol: "Operario" },
    { id: 3, nombre: "Carlos Ruiz", email: "carlos@example.com", rol: "Administrador" },
  ]);

  const eliminarUsuario = (id: number) => {
    if (confirm("¿Seguro que quieres eliminar este usuario?")) {
      setUsuarios(usuarios.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="p-6 font-acidGrotesk">
      <h2 className="text-2xl font-bold mb-4 text-cyan-700 dark:text-cyan-400">
        Gestión de Usuarios
      </h2>

      {/* Botón agregar */}
      <Link to="/admin/usuarios/nuevo">
        <button className="mb-4 px-4 py-2 bg-cyan-700 text-white rounded hover:bg-cyan-600">
          + Nuevo Usuario
        </button>
      </Link>

      {/* Tabla de usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg shadow-md">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-2 border">Nombre</th>
              <th className="p-2 border">Correo</th>
              <th className="p-2 border">Rol</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr
                key={usuario.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <td className="p-2 border">{usuario.nombre}</td>
                <td className="p-2 border">{usuario.email}</td>
                <td className="p-2 border">{usuario.rol}</td>
                <td className="p-2 border flex gap-2">
                  <Link to={`/admin/usuarios/editar/${usuario.id}`}>
                    <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Editar
                    </button>
                  </Link>
                  <button
                    onClick={() => eliminarUsuario(usuario.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {usuarios.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
