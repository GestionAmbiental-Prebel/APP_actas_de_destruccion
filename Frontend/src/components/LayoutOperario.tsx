// src/components/LayoutOperario.tsx
import { Outlet } from "react-router-dom";

export const LayoutOperario = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header global */}
      {/* Header ya incluye Navbar */}
      
      {/* Contenedor principal */}
      <div className="p-6 flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
