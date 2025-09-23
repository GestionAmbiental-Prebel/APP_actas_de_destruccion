"use client";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ToggleTheme from "../theme/toggleTheme";
import HomeIcon from "../../icons/homeIcon";
import { navItems } from "./navConfig";

interface NavbarProps {
  role: "gestor" | "operario" | "admin";
  variant?: "normal" | "punto-verde";
}

export const Navbar = ({ role, variant = "normal" }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const items = navItems[role][variant] || [];

  return (
    <section className="flex items-center w-full relative">
      <nav className="w-full flex items-center justify-between">
        {/* Inicio 
        <div className="flex-shrink-0">
          <Link
            to="/"
            className={`flex gap-1 items-center hover:text-cyan-600 dark:hover:text-cyan-400 ${
              isActive("/") ? "border-b-2 border-cyan-600" : ""
            }`}
          >
            <HomeIcon className="w-5 h-5 fill-cyan dark:fill-bone" />
            Inicio
          </Link>
        </div>*/}

        {/* Items centrados */}
        <ul className="flex gap-6 justify-center flex-1">
          {items.map(({ label, path }) => (
            <li key={path} className="whitespace-nowrap">
              <Link
                to={path}
                className={`hover:text-cyan-600 dark:hover:text-cyan-400 ${
                  isActive(path) ? "border-b-2 border-cyan-600" : ""
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Acciones a la derecha */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <ToggleTheme />
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Modal confirmación */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/50 z-50 pt-24">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-bone">
              ¿Cerrar sesión?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Tu sesión actual se cerrará y volverás a la pantalla de inicio de sesión.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-red-700"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
