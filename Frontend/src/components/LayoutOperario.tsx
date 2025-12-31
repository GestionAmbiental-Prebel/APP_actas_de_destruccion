// src/components/LayoutOperario.tsx
import { Outlet, useLocation } from "react-router-dom";

interface LayoutOperarioProps {
  variant?: "normal" | "punto-verde"; 
}

export const LayoutOperario = ({ variant = "normal" }: LayoutOperarioProps) => {
  const location = useLocation();
  
  // Determinar si es punto verde para estilos diferentes
  const isPuntoVerde = variant === "punto-verde";
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Puedes añadir aquí un header específico para operario si lo necesitas */}
      
      <div 
        key={location.key} // ← location.key es único para cada navegación
        className={`p-6 flex-1 overflow-auto transition-opacity duration-200 ${
          isPuntoVerde ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};