import { ConciliacionExtendida } from "../../services/actasConciliadas.service";
import { getEstilosPorEstado, getTextoEstado } from "../../utils/estilosActa";

type ActaConciliadorSectionProps = {
  acta: ConciliacionExtendida;
};

export const ActaConciliadorSection = ({ acta }: ActaConciliadorSectionProps) => {
  const estilos = getEstilosPorEstado(acta.tipo);
  const textoEstado = getTextoEstado(acta.tipo);

  return (
    <div className={`mb-6 ${estilos.bgColor} p-4 rounded-lg`}>
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <span>👤</span>
        <span>Conciliador (Recepción)</span>
        <span className={`text-sm px-2 py-1 rounded ${estilos.badgeColor}`}>
          {textoEstado} {estilos.icon}
        </span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cédula</p>
          <p className="font-semibold">
            {acta.conciliador_documento ? acta.conciliador_documento : "No registrada"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
          <p className="font-semibold">{acta.conciliador_nombre || "Sin nombre registrado"}</p>
        </div>
      </div>

      {acta.tipo === "conciliada" && acta.fecha_conciliacion && (
        <div className={`mt-3 pt-3 border-t ${estilos.borderColor}`}>
          <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Conciliación</p>
          <p className="font-semibold">
            {new Date(acta.fecha_conciliacion).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
};