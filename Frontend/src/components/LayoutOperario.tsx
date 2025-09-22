// src/components/LayoutOperario.tsx
import { Outlet } from "react-router-dom";

interface LayoutOperarioProps {
  variant?: "normal" | "punto-verde"; 
}

export const LayoutOperario = ({ variant = "normal" }: LayoutOperarioProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* El Header global ya está en tu Layout principal */}

      {/* Contenedor principal */}
      <main className="p-6 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
