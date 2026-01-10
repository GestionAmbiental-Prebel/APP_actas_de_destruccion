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
      console.log("Iniciando carga de actas conciliadas...");
      const data = await obtenerActasConciliadas();
      
      // DEPURACIÓN DETALLADA
      console.log("=== DATOS OBTENIDOS DEL SERVICIO ===");
      console.log("Total de actas:", data.length);
      
      if (data.length > 0) {
        console.log("Primera acta:", data[0]);
        console.log("Tipo de primera acta:", data[0].tipo);
        console.log("Residuos de primera acta:", data[0].residuos);
        console.log("Número de residuos:", data[0].residuos.length);
        
        // Verificar cada residuo
        data[0].residuos.forEach((r, i) => {
          console.log(`Residuo ${i + 1}:`, {
            nombre: r.residuo_nombre,
            residuo_otro: r.residuo_otro,
            descripcion_residuo_otro: r.descripcion_residuo_otro,
            motivo: r.motivo,
            motivo_otro: r.motivo_otro,
            descripcion_motivo_otro: r.descripcion_motivo_otro,
            peso_reportado: r.peso_reportado,
            peso_conciliado: r.peso_conciliado
          });
        });
      }
      
      const ordenadas = sortByDateDesc(data, "fecha_acta");
      setActas(ordenadas);
    } catch (err) {
      console.error("Error en useActasConciliadas:", err);
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