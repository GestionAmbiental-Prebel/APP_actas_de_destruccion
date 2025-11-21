import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./components/header/header"; 

export default function Layout() {
  return (
    <main className="font-acidGrotesk text-[#202020] dark:text-bone bg-radial from-bone via-bone to-white dark:from-skyBlue dark:via-none dark:to-[#202020] min-h-screen flex">
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 flex-1 overflow-auto text-[#202020] dark:text-skyBlue bg-radial from-skyBlue via-skyBlue to-white dark:from-skyBlue dark:via-none dark:to-[#202020] rounded-tl-2xl">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
