import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AREAS = [
  "Producción",
  "Calidad",
  "Almacén",
  "Administración",
  "Logística",
  "Seguridad",
  "Mantenimiento",
];

export const LoginPage = () => {
  const [area, setArea] = useState("");
  const [filteredAreas, setFilteredAreas] = useState(AREAS);
  const [showDropdown, setShowDropdown] = useState(false);
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    if (!area || !password) {
      alert("Por favor completa todos los campos");
      return;
    }
    navigate("/operario/formulario");
  };

  const handleAreaChange = (value: string) => {
    setArea(value);
    setShowDropdown(true);
    setFilteredAreas(
      AREAS.filter((a) =>
        a.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleSelectArea = (value: string) => {
    setArea(value);
    setShowDropdown(false);
  };

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-10 w-full max-w-md flex flex-col items-center transition-transform transform hover:scale-105">
        
        {/* Logos */}
        <div className="flex justify-between w-full mb-6">
          <img src="/image/Ambiental_AzulClaro.webp" alt="Logo Prebel" className="h-12 object-contain" />
          <img src="/image/Prebel_AzulClaro_SF.webp" alt="Logo Ambiental" className="h-12 object-contain" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-extrabold text-sky-700 dark:text-sky-400 mb-8 text-center">
          Actas de Destrucción
        </h1>

        {/* Área */}
        <div className="w-full relative mb-4" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Área"
            value={area}
            onChange={(e) => handleAreaChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition"
          />
          {showDropdown && filteredAreas.length > 0 && (
            <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 mt-1 rounded-lg max-h-40 overflow-auto">
              {filteredAreas.map((a) => (
                <li
                  key={a}
                  onClick={() => handleSelectArea(a)}
                  className="px-3 py-2 hover:bg-sky-100 dark:hover:bg-gray-600 cursor-pointer"
                >
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Contraseña */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition"
        />

        {/* Botón */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-500 text-white font-semibold py-3 rounded-xl shadow-lg transition transform hover:scale-105 mb-2"
        >
          Ingresar
        </button>

        {/* Olvidaste tu contraseña */}
        <p
          onClick={() => setShowForgotModal(true)}
          className="text-sm text-sky-700 dark:text-sky-400 cursor-pointer hover:underline mb-4"
        >
          ¿Olvidaste tu contraseña?
        </p>

        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
          Mock login para pruebas de navegación
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
