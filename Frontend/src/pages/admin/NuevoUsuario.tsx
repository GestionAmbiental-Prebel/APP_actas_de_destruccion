// src/pages/admin/NuevoUsuario.tsx
import { useState } from "react";

export const NuevoUsuario = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "operario",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Nuevo usuario creado:", formData);
    // 🔹 Aquí iría la lógica para enviar a backend
  };

  return (
    <div className="p-6 font-acidGrotesk max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-cyan-700 dark:text-cyan-400">
        Crear Nuevo Usuario
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
      >
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

       

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rol de usuario
          </label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="operario">Operario</option>
            <option value="operario-punto-verde">Operario Punto Verde</option>
            <option value="gestor">Gestor</option>
            <option value="gestor-punto-verde">Gestor Punto Verde</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-cyan-600 text-white font-semibold hover:bg-cyan-700 transition"
          >
            Guardar Usuario
          </button>
        </div>
      </form>
    </div>
  );
};
