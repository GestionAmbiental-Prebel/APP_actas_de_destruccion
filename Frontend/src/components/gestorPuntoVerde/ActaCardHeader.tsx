import { ConciliacionExtendida } from "../../services/actasConciliadas.service";
import { getEstilosPorEstado, getTextoEstado } from "../../utils/estilosActa";

type ActaCardHeaderProps = {
  acta: ConciliacionExtendida;
  pesoReportado: number;
  pesoConciliado: number;
};

export const ActaCardHeader = ({ acta, pesoReportado, pesoConciliado }: ActaCardHeaderProps) => {
  const estilos = getEstilosPorEstado(acta.tipo);
  const textoEstado = getTextoEstado(acta.tipo);

  return (
    <div className="flex justify-between items-start border-b pb-4 mb-4">
      <div className="flex items-center gap-3">
        <div className={`text-2xl ${estilos.textColor}`}>{estilos.icon}</div>
        <div>
          <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
            Acta #{acta.numero_acta}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${estilos.badgeColor}`}>
              {textoEstado}
            </span>
            <p className="text-gray-600 dark:text-gray-400">
              📅{" "}
              {new Date(acta.fecha_acta).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Peso Reportado</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {pesoReportado.toFixed(2)} kg
          </p>
        </div>

        {acta.tipo !== "pendiente" && (
          <div className={`${estilos.bgColor} px-4 py-2 rounded-lg`}>
            <p className="text-sm text-gray-600 dark:text-gray-400">Peso Conciliado</p>
            <p className={`text-2xl font-bold ${estilos.pesoColor}`}>
              {pesoConciliado.toFixed(2)} kg
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
