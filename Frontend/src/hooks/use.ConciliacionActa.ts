import { useState } from "react";
import { apiRequest } from "../services/api.service";
import { ConciliacionExtendida } from "../services/actasConciliadas.service";
import { validarSoloNumeros } from "../utils/actaValidations";
import { ResiduoEditable } from "../types/actas.types";

export function useConciliacionActa() {
  const [open, setOpen] = useState(false);
  const [acta, setActa] = useState<ConciliacionExtendida | null>(null);
  const [residuos, setResiduos] = useState<ResiduoEditable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 CAMPOS DEL ACTA (EXISTENTES EN EL SERVICE)
  const [consecutivo, setConsecutivo] = useState("");
  const [numeroInventario, setNumeroInventario] = useState("");
  const [documentoConciliador, setDocumentoConciliador] = useState("");

  /* =========================
     ABRIR / CERRAR
  ========================== */

  const abrirConciliacion = (actaSeleccionada: ConciliacionExtendida) => {
    setError("");
    setOpen(true);
    setActa(actaSeleccionada);

    setConsecutivo(actaSeleccionada.consecutivo ?? "");
    setNumeroInventario(actaSeleccionada.numero_inventario ?? "");
    setDocumentoConciliador("");

    setResiduos(
      actaSeleccionada.residuos.map((r) => ({
        acta_generacion_residuo_id: r.acta_generacion_residuo_id,
        residuo_id: 0,
        residuo_nombre: r.residuo_nombre,
        categoria_id: null,
        motivo: r.motivo,
        descripcion_residuo_otro: r.descripcion_residuo_otro,
        descripcion_motivo_otro: r.descripcion_motivo_otro,
        peso_reportado: r.peso_reportado,
        peso_conciliado: r.peso_conciliado ?? "",
      }))
    );
  };

  const cerrarConciliacion = () => {
    setOpen(false);
    setActa(null);
    setResiduos([]);
    setError("");

    setConsecutivo("");
    setNumeroInventario("");
    setDocumentoConciliador("");
  };

  /* =========================
     RESIDUOS
  ========================== */

  const onChangeResiduo = <K extends keyof ResiduoEditable>(
    index: number,
    campo: K,
    valor: ResiduoEditable[K]
  ) => {
    setResiduos((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              [campo]:
                campo.includes("peso") && !validarSoloNumeros(valor as string)
                  ? r[campo]
                  : valor,
            }
          : r
      )
    );
  };

  /* =========================
     VALIDACIONES
  ========================== */

  const validar = (): boolean => {
    if (!consecutivo)
      return setError("Debe ingresar el consecutivo del acta"), false;

    if (!numeroInventario)
      return setError("Debe ingresar el número de inventario"), false;

    if (!documentoConciliador)
      return setError("Debe ingresar el documento del conciliador"), false;

    if (!residuos.length)
      return setError("No hay residuos para conciliar"), false;

    for (const r of residuos) {
      if (!r.peso_conciliado)
        return (
          setError("Todos los residuos deben tener peso conciliado"), false
        );
    }

    setError("");
    return true;
  };

  /* =========================
     GUARDAR (BACKEND REAL)
  ========================== */

  const guardarConciliacion = async () => {
    if (!acta) return;
    if (!validar()) return;

    try {
      setLoading(true);

      // 🔹 ACTUALIZA EL ACTA
      await apiRequest(`/actas/${acta.acta_id}/`, {
        method: "PUT",
        body: {
          consecutivo,
          numero_inventario: numeroInventario,
          documento_recepcion: documentoConciliador,
        },
      });

      // 🔹 CONCILIA LOS RESIDUOS
      await Promise.all(
        residuos.map((r) =>
          apiRequest(
            `/actas-generacion-residuo/${r.acta_generacion_residuo_id}/`,
            {
              method: "PUT",
              body: {
                peso_conciliado: Number(r.peso_conciliado),
              },
            }
          )
        )
      );

      cerrarConciliacion();
    } catch (e) {
      console.error(e);
      setError("Error al guardar la conciliación");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RETURN
  ========================== */

  return {
    // modal
    open,
    loading,
    error,

    // datos
    residuos,
    consecutivo,
    numeroInventario,
    documentoConciliador,

    // setters
    setConsecutivo,
    setNumeroInventario,
    setDocumentoConciliador,

    // acciones
    abrirConciliacion,
    cerrarConciliacion,
    onChangeResiduo,
    guardarConciliacion,
  };
}
