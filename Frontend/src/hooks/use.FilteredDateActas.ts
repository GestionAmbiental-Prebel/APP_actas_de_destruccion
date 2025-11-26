import { useState } from 'react';

type CampoBusqueda = string | ((item: any) => string);

// límite máximo de caracteres permitidos en la búsqueda
const MAX_BUSQUEDA = 50;

export function useFiltroActas<T extends { fecha_acta: string }>(
  items: T[],
  camposBusqueda: CampoBusqueda[] = [
    "numero_acta",
    "numero_inventario",
    "consecutivo"
  ] // ahora busca también por inventario y consecutivo
) {
  const [busqueda, setBusquedaState] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // wrapper con límite
  const setBusqueda = (value: string) => {
    if (value.length <= MAX_BUSQUEDA) {
      setBusquedaState(value);
    }
  };

  const filtrar = (): T[] => {
    return items.filter((item) => {
      const coincideBusqueda =
        !busqueda ||
        camposBusqueda.some((campo) => {
          const valor =
            typeof campo === "function"
              ? campo(item)
              : (item as any)[campo];

          return valor
            ?.toString()
            .toLowerCase()
            .includes(busqueda.toLowerCase());
        });

      const cumpleFecha =
        (!fechaInicio || new Date(item.fecha_acta) >= new Date(fechaInicio)) &&
        (!fechaFin || new Date(item.fecha_acta) <= new Date(fechaFin));

      return coincideBusqueda && cumpleFecha;
    });
  };

  const limpiarFiltros = () => {
    setBusquedaState("");
    setFechaInicio("");
    setFechaFin("");
  };

  return {
    busqueda,
    setBusqueda,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    filtrar,
    limpiarFiltros,
    MAX_BUSQUEDA,
  };
}
