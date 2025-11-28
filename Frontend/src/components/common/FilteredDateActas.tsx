// ---------------------------------------------
// UI Component: FiltrosActas
// Archivo: FiltrosActas.tsx
// ---------------------------------------------
import React, { ChangeEvent } from "react";

type FiltrosActasProps = {
  busqueda: string;
  setBusqueda: (v: string) => void;
  fechaInicio: string;
  setFechaInicio: (v: string) => void;
  fechaFin: string;
  setFechaFin: (v: string) => void;
  limpiarFiltros: () => void;
  onRefrescar?: () => void;
  loading?: boolean;

  labelBusqueda?: string;
  placeholderBusqueda?: string;
  MAX_BUSQUEDA?: number;
};

export default function FiltrosActas({
  busqueda,
  setBusqueda,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  limpiarFiltros,
  onRefrescar,
  loading = false,

  labelBusqueda = "Buscar por número, nombre o cédula",
  placeholderBusqueda = "Ej: 0001 / Juan Perez / 12345678",
  MAX_BUSQUEDA = 50,
}: FiltrosActasProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        
        {/* Busqueda */}
        <div className="flex flex-col flex-1 min-w-[200px]">
          <label className="font-medium mb-1">{labelBusqueda}</label>
          <input
            type="text"
            placeholder={placeholderBusqueda}
            value={busqueda}
            maxLength={MAX_BUSQUEDA}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setBusqueda(e.target.value)
            }
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue focus:outline-none"
          />
          <small className="text-gray-500 dark:text-gray-300 mt-1">
            {busqueda.length}/{MAX_BUSQUEDA} caracteres
          </small>
        </div>

        {/* Fecha inicio */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Fecha inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFechaInicio(e.target.value)
            }
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue focus:outline-none"
          />
        </div>

        {/* Fecha fin */}
        <div className="flex flex-col">
          <label className="font-medium mb-1">Fecha fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFechaFin(e.target.value)
            }
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue focus:outline-none"
          />
        </div>

        {/* Refrescar */}
        {onRefrescar && (
          <button
            onClick={onRefrescar}
            disabled={loading}
            className="bg-skyBlue dark:bg-lightBlue text-white px-4 py-2 rounded-lg font-semibold"
          >
            {loading ? "Actualizando..." : "🔄 Refrescar"}
          </button>
        )}

        {/* Limpiar */}
        {(busqueda || fechaInicio || fechaFin) && (
          <button
            onClick={limpiarFiltros}
            className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold"
          >
            🗑️ Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
