// components/common/NovedadBadge.tsx
import { useState } from "react";

interface NovedadBadgeProps {
  tieneNovedad: boolean;
  descripcion?: string;
  residuosConNovedad?: number;
}

export function NovedadBadge({ tieneNovedad, descripcion, residuosConNovedad = 0 }: NovedadBadgeProps) {
  const [mostrarTooltip, setMostrarTooltip] = useState(false);

  if (!tieneNovedad) return null;

  const badgeText = residuosConNovedad > 0 
    ? `⚠️ Con Novedad (${residuosConNovedad})` 
    : "⚠️ Con Novedad";

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
        onMouseEnter={() => setMostrarTooltip(true)}
        onMouseLeave={() => setMostrarTooltip(false)}
        onClick={() => setMostrarTooltip(!mostrarTooltip)}
      >
        {badgeText}
        {descripcion && <span className="text-xs">ℹ️</span>}
      </button>

      {descripcion && mostrarTooltip && (
        <div className="absolute z-10 left-0 mt-2 w-72 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg text-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">Novedad</p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-2">{descripcion}</p>
          {residuosConNovedad > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {residuosConNovedad} residuo{residuosConNovedad !== 1 ? 's' : ''} con discrepancia
            </p>
          )}
        </div>
      )}
    </div>
  );
}