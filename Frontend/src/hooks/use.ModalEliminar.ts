import { useState } from "react";
import { ConciliacionExtendida } from "../services/actasConciliadas.service";
import { apiRequest } from "../services/api.service";

export const useModalEliminar = (onSuccess: () => Promise<void>) => {
  const [actaAEliminar, setActaAEliminar] = useState<ConciliacionExtendida | null>(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const abrirModal = (acta: ConciliacionExtendida) => {
    setActaAEliminar(acta);
    setModalEliminarAbierto(true);
  };

  const cerrarModal = () => {
    setModalEliminarAbierto(false);
    setActaAEliminar(null);
  };

  const eliminarActa = async () => {
    if (!actaAEliminar) return;

    try {
      setEliminando(true);
      await apiRequest(`/actas/${actaAEliminar.acta_id}/`, { method: "DELETE" });
      alert("✅ Acta eliminada exitosamente");
      await onSuccess();
      cerrarModal();
    } catch (err: any) {
      console.error("❌ Error eliminando acta:", err);
      alert(`Error al eliminar acta: ${err.message || "Error desconocido"}`);
    } finally {
      setEliminando(false);
    }
  };

  return {
    actaAEliminar,
    modalEliminarAbierto,
    eliminando,
    abrirModal,
    cerrarModal,
    eliminarActa,
  };
};
