"use client";
import { useState } from "react";
import { Navbar } from "./nabar";
import { LogoPrebel } from "./logoPrebel";
import { useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  let role: "gestor" | "operario" | "admin" = "operario";
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
    <header className="w-full sticky top-0 z-50 bg-lightBlue/20 dark:bg-gray-400/10 backdrop-filter backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <LogoPrebel />
          </div>

          {/* Menú desktop */}
          <div className="hidden md:flex flex-1 justify-center">
            <Navbar role={role} variant={variant} />
          </div>

          {/* Botón menú mobile */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {mobileOpen ? (
                // X icon
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-lightBlue/20 dark:bg-gray-400/10 backdrop-filter backdrop-blur-lg shadow-inner">
          <Navbar role={role} variant={variant} />
        </div>
      )}
    </header>
  );
};
