import Button from "../common/Button";
import { ConciliacionExtendida } from "../../services/actasConciliadas.service";

type ModalEliminarActaProps = {
  acta: ConciliacionExtendida;
  eliminando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  esGestorAmbiental?: boolean; // Nueva prop opcional
};

export const ModalEliminarActa = ({
  acta,
  eliminando,
  onConfirmar,
  onCancelar,
  esGestorAmbiental = false, // Valor por defecto
}: ModalEliminarActaProps) => {
  // Mensajes personalizados según el rol
  const titulo = esGestorAmbiental 
    ? "Eliminar Acta Conciliada" 
    : "Confirmar Eliminación";

  const mensajePrincipal = esGestorAmbiental
    ? `¿Estás seguro de que deseas eliminar el Acta #${acta.numero_acta} que ya ha sido conciliada?`
    : `¿Estás seguro de que deseas eliminar el Acta #${acta.numero_acta}?`;

  const mensajeSecundario = esGestorAmbiental
    ? "Esta acción eliminará permanentemente los datos de conciliación y no se puede deshacer."
    : "Esta acción no se puede deshacer.";

  const textoBotonConfirmar = eliminando 
    ? "Eliminando..." 
    : esGestorAmbiental 
      ? "Eliminar Acta Conciliada" 
      : "Eliminar";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className={`text-xl font-bold mb-4 ${
          esGestorAmbiental 
            ? "text-orange-600 dark:text-orange-400" 
            : "text-red-600 dark:text-red-400"
        }`}>
          {titulo}
        </h3>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {mensajePrincipal}
          </p>
          
          {esGestorAmbiental && acta.fecha_conciliacion && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-medium">Conciliada el:</span>{" "}
                {new Date(acta.fecha_conciliacion).toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {acta.conciliador_nombre && (
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  <span className="font-medium">Por:</span> {acta.conciliador_nombre}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mensajeSecundario}
          </p>

          {esGestorAmbiental && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ Como Gestor Ambiental, esta acción eliminará todos los registros 
                de conciliación asociados a esta acta.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button 
            variant="secondary" 
            onClick={onCancelar} 
            disabled={eliminando}
            className="px-4 py-2"
          >
            Cancelar
          </Button>
          <Button 
            variant={esGestorAmbiental ? "danger" : "danger"}
            onClick={onConfirmar} 
            disabled={eliminando}
            className="px-4 py-2"
          >
            {textoBotonConfirmar}
          </Button>
        </div>
      </div>
    </div>
  );
};