// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"operario" | "admin" | "">("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!email || !password || !selectedRole) {
      alert("Por favor completa todos los campos");
      return;
    }
    if (selectedRole === "operario") {
      navigate("/operario/formulario");
    } else if (selectedRole === "admin") {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-10 w-full max-w-md flex flex-col items-center transition-transform transform hover:scale-105">
        
        {/* Logos */}
        <div className="flex justify-between w-full mb-6">
          <img src="/logo1.png" alt="Logo 1" className="h-12 object-contain" />
          <img src="/logo2.png" alt="Logo 2" className="h-12 object-contain" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-extrabold text-sky-700 dark:text-sky-400 mb-8 text-center">
          Actas de Destrucción
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition"
        />

        {/* Contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition"
        />

        {/* Rol */}
        <select
          value={selectedRole}
          onChange={(e) =>
            setSelectedRole(e.target.value as "operario" | "admin" | "")
          }
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-6 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition"
        >
          <option value="">Selecciona un rol</option>
          <option value="operario">Operario</option>
          <option value="admin">Administrador</option>
        </select>

        {/* Botón */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-500 text-white font-semibold py-3 rounded-xl shadow-lg transition transform hover:scale-105 mb-4"
        >
          Ingresar
        </button>

        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Mock login para pruebas de navegación
        </p>
      </div>
    </div>
  );
};
