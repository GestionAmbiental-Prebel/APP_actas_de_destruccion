import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  { id: "operario", nombre: "Operario Normal", ruta: "/subarea" },
  { id: "operario-punto-verde", nombre: "Operario Punto Verde", ruta: "/punto-verde" },
  { id: "gestor-punto-verde", nombre: "Gestor Punto Verde", ruta: "/gestor-punto-verde/conciliadas" },
  { id: "gestor-ambiental", nombre: "Gestor Ambiental", ruta: "/gestor-ambiental" },
];

export const LoginPage = () => {
  const [rolSeleccionado, setRolSeleccionado] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!rolSeleccionado || !password) {
      alert("Por favor completa todos los campos");
      return;
    }

    if (password !== "1234") {
      alert("Contraseña incorrecta. Usa '1234' para pruebas.");
      return;
    }

    const rol = ROLES.find((r) => r.id === rolSeleccionado);
    if (rol) {
      navigate(rol.ruta);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 w-full max-w-md flex flex-col items-center">
        
        {/* Logos */}
        <div className="flex justify-between w-full mb-6">
          <img src="/image/Ambiental_AzulClaro.webp" alt="Logo Ambiental" className="h-12 object-contain" />
          <img src="/image/Prebel_AzulClaro_SF.webp" alt="Logo Prebel" className="h-12 object-contain" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-extrabold text-sky-700 dark:text-sky-400 mb-8 text-center">
          Sistema de Actas
        </h1>

        {/* Selección de Rol */}
        <div className="w-full mb-4">
          <select
            value={rolSeleccionado}
            onChange={(e) => setRolSeleccionado(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition appearance-none"
          >
            <option value="">Selecciona tu rol</option>
            {ROLES.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Contraseña */}
        <input
          type="password"
          placeholder="Contraseña (1234 para pruebas)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition"
        />

        {/* Botón */}
        <button
          onClick={handleLogin}
          disabled={!rolSeleccionado || !password}
          className={`w-full font-semibold py-3 rounded-xl shadow-lg transition ${
            rolSeleccionado && password
              ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-500 text-white hover:scale-105"
              : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          Ingresar
        </button>

        {/* Olvidaste tu contraseña */}
        <p
          onClick={() => setShowForgotModal(true)}
          className="text-sm text-sky-700 dark:text-sky-400 cursor-pointer hover:underline mt-4 mb-2"
        >
          ¿Olvidaste tu contraseña?
        </p>

        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Para pruebas usa contraseña: <strong>1234</strong>
        </p>
      </div>

      {/* Modal de Olvidaste tu contraseña */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-bone mb-2">
              Recuperar contraseña
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Contacta con la oficina Ambiental para que hagan el cambio de contraseña
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};