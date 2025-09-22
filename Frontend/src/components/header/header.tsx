"use client";
import { Navbar } from "./nabar";
import { LogoPrebel } from "./logoPrebel";
import { useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  // 👇 Determinar rol y variante según la ruta
  let role: "gestor" | "operario" | "admin" = "operario"; // 👈 ahora también admin
  let variant: "normal" | "punto-verde" = "normal";

  if (location.pathname.startsWith("/admin")) {
    role = "admin";
  } else if (location.pathname.startsWith("/gestor-punto-verde")) {
    role = "gestor";
    variant = "punto-verde";
  } else if (location.pathname.startsWith("/gestor")) {
    role = "gestor";
    variant = "normal";
  } else if (location.pathname.startsWith("/operario-punto-verde")) {
    role = "operario";
    variant = "punto-verde";
  } else if (location.pathname.startsWith("/operario")) {
    role = "operario";
    variant = "normal";
  }

  return (
    <header className="grid grid-cols-3 h-16 items-center p-4 text-cyan dark:text-bone bg-lightBlue/20 dark:bg-gray-400/10 backdrop-filter backdrop-blur-lg sticky top-0 z-50">
      {/* Columna izquierda: Título */}
      <h1 className="text-2xl font-bold truncate">Actas de Destrucción</h1>

      {/* Columna central: Navbar */}
      <div className="flex justify-center">
        <Navbar role={role} variant={variant} />
      </div>

      {/* Columna derecha: Logo */}
      <div className="flex justify-end">
        <LogoPrebel />
      </div>
    </header>
  );
};
