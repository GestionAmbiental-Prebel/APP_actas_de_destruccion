import Button from "../common/Button";
import { ConciliacionExtendida } from "../../services/actasConciliadas.service";

type ModalEliminarActaProps = {
  acta: ConciliacionExtendida;
  eliminando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export const ModalEliminarActa = ({
  acta,
  eliminando,
  onConfirmar,
  onCancelar,
}: ModalEliminarActaProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
          Confirmar Eliminación
        </h3>

        <p className="mb-6">
          ¿Estás seguro de que deseas eliminar el Acta #{acta.numero_acta}?
          <br />
          <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
        </p>

        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={onCancelar} disabled={eliminando}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirmar} disabled={eliminando}>
            {eliminando ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
