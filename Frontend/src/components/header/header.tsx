// src/components/header/Header.tsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./nabar";
import { LogoPrebel } from "./logoPrebel";

export const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  let role: "operario" | "gestor" | "admin" = "operario";
  let variant: "normal" | "punto-verde" = "normal";

  if (location.pathname.startsWith("/admin")) {
    role = "admin";
  } else if (location.pathname.startsWith("/gestor-punto-verde")) {
    role = "gestor";
    variant = "punto-verde";
  } else if (location.pathname.startsWith("/gestor")) {
    role = "gestor";
  } else if (location.pathname.startsWith("/punto-verde")) {
    role = "operario";
    variant = "punto-verde";
  } else if (location.pathname.startsWith("/subarea")) {
    role = "operario";
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-lightBlue/20 dark:bg-gray-400/10 backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <LogoPrebel />

        <div className="hidden md:flex flex-1 justify-center">
          <Navbar role={role} variant={variant} />
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-md"
        >
          ☰
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4">
          <Navbar role={role} variant={variant} />
        </div>
      )}
    </header>
  );
};
