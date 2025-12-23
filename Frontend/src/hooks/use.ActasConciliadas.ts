import { useState, useEffect } from "react";
import { ConciliacionExtendida, obtenerActasConciliadas } from "../services/actasConciliadas.service";
import { sortByDateDesc } from "../utils/sortByDate";

export const useActasConciliadas = () => {
  const [actas, setActas] = useState<ConciliacionExtendida[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarActas = async () => {
    try {
      setLoading(true);
      const data = await obtenerActasConciliadas();
      setActas(sortByDateDesc(data, "fecha_acta"));
    } catch (err) {
      console.error(err);
      setError("Error cargando actas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActas();
  }, []);

  return { actas, loading, error, cargarActas };
};
