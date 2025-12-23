type ActaOperarioSectionProps = {
  documento?: string;
  nombre?: string;
  titulo: string;
};

export const ActaOperarioSection = ({ documento, nombre, titulo }: ActaOperarioSectionProps) => {
  if (!documento) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-2">{titulo}</h3>
      <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Cédula</p>
          <p className="font-semibold">{documento || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
          <p className="font-semibold">{nombre || "Sin nombre registrado"}</p>
        </div>
      </div>
    </div>
  );
};