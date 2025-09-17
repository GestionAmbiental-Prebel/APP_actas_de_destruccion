// src/pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState<"operario" | "admin" | "">("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (selectedRole === "operario") {
      navigate("/operario/formulario");
    } else if (selectedRole === "admin") {
      navigate("/admin/dashboard");
    } else {
      alert("Selecciona un rol para continuar");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6">Login Mock</h1>
      <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value as "operario" | "admin" | "")}
        className="p-2 border rounded mb-4"
      >
        <option value="">Selecciona un rol</option>
        <option value="operario">Operario</option>
        <option value="admin">Administrador</option>
      </select>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Ingresar
      </button>
    </div>
  );
};
