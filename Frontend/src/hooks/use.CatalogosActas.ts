import { useState, useEffect } from "react";
import {
  obtenerResiduosEspecificos,
  obtenerCategoriasResiduos,
  obtenerSubAreas,
  obtenerCentrosCosto,
} from "../services/catalogo.service";
import { obtenerOperarios, obtenerOperariosPuntoVerde } from "../services/operarios.service";

export const useCatalogos = () => {
  const [residuosEspecificos, setResiduosEspecificos] = useState<any[]>([]);
  const [categoriasResiduos, setCategoriasResiduos] = useState<any[]>([]);
  const [subareas, setSubareas] = useState<any[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [operarios, setOperarios] = useState<any[]>([]);
  const [operariosPuntoVerde, setOperariosPuntoVerde] = useState<any[]>([]);

  const motivosFiltrados = [
    { id: 1, nombre: "Bloqueado" },
    { id: 2, nombre: "Obsoleto" },
    { id: 3, nombre: "Rechazado" },
    { id: 4, nombre: "Vencido" },
    { id: 5, nombre: "Otro" },
  ];

  const cargarCatalogos = async () => {
    try {
      const [residuosData, categoriasData, subareasData, centrosCostoData, operariosData] =
        await Promise.all([
          obtenerResiduosEspecificos(),
          obtenerCategoriasResiduos(),
          obtenerSubAreas(),
          obtenerCentrosCosto(),
          obtenerOperarios(),
        ]);

      setResiduosEspecificos(residuosData);
      setCategoriasResiduos(categoriasData);
      setSubareas(subareasData);
      setCentrosCosto(centrosCostoData);
      setOperarios(operariosData);

      const operariosPVData = await obtenerOperariosPuntoVerde(subareasData);
      setOperariosPuntoVerde(operariosPVData);
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  return {
    residuosEspecificos,
    categoriasResiduos,
    subareas,
    centrosCosto,
    operarios,
    operariosPuntoVerde,
    motivosFiltrados,
  };
};