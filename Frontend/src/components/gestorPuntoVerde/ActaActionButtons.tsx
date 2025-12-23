type ActaActionButtonsProps = {
  onEditar: () => void;
  onEliminar: () => void;
};

export const ActaActionButtons = ({ onEditar, onEliminar }: ActaActionButtonsProps) => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
      <button
        onClick={onEditar}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
        title="Editar acta"
      >
        <span className="text-lg">✏️</span>
        <span>Editar Acta</span>
      </button>
      <button
        onClick={onEliminar}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
        title="Eliminar acta"
      >
        <span className="text-lg">🗑️</span>
        <span>Eliminar Acta</span>
      </button>
    </div>
  );
};