import { apiRequest } from "./api.service";

// Conciliar un acta
export const conciliarActa = async (
  actaId: number,
  documentoRecepcion: string,
  residuos: {
    id: number;
    peso_conciliado: number;
    descripcion_novedad?: string;
  }[]
) => {
  const payload = {
    documento_recepcion: documentoRecepcion,
    residuos: residuos,
  };

  return apiRequest(`/conciliacion/${actaId}/conciliar/`, {
    method: "POST",
    body: payload,
  });
};
