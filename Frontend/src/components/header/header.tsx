"use client";

import { Navbar } from "./nabar";
import { LogoPrebel } from "./logoPrebel";


export const Header = () => {
  return (
    <header className="grid grid-cols-3 h-16 items-center p-4 text-cyan dark:text-bone bg-lightBlue/20 dark:bg-gray-400/10 backdrop-filter backdrop-blur-lg sticky top-0 z-50">
      {/* Columna izquierda */}
      <h1 className="text-2xl font-bold truncate">Templete</h1>

      {/* Columna central: Navbar */}
      <div className="flex justify-center">
        <Navbar />
      </div>

      {/* Columna derecha: Logo o avatar */}
      <div className="flex justify-end">
        <LogoPrebel />
      </div>
    </header>
  );
};
