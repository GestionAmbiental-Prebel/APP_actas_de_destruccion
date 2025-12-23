import { ConciliacionExtendida } from "../../services/actasConciliadas.service";

type ActaInfoSectionProps = {
  acta: ConciliacionExtendida;
};

export const ActaInfoSection = ({ acta }: ActaInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm text-gray-700 dark:text-gray-300">
      {acta.consecutivo && (
        <p>
          <span className="font-semibold">Consecutivo:</span> {acta.consecutivo}
        </p>
      )}
      {acta.numero_inventario && (
        <p>
          <span className="font-semibold">Número de Inventario:</span> {acta.numero_inventario}
        </p>
      )}
      <p>
        <span className="font-semibold">Subárea:</span> {acta.subarea_nombre ?? "Sin subárea"}
      </p>
      <p>
        <span className="font-semibold">Centro de Costo:</span>{" "}
        {acta.centro_costo_codigo
          ? `${acta.centro_costo_codigo}${
              acta.centro_costo_nombre ? ` – ${acta.centro_costo_nombre}` : ""
            }`
          : "Sin centro de costo"}
      </p>
    </div>
  );
};