// src/components/gestor/ActaCard.tsx
interface Acta {
  id: number;
  nombre: string;
  cedula: string;
  sede: string;
  procedencia: string;
  area: string;
  centroCostos: string;
  categoria: string;
  residuo: string;
  motivo: string;
  fecha: string;
}

interface ActaCardProps {
  acta: Acta;
  onEdit: (acta: Acta) => void;
  onDelete: (id: number) => void;
}

export const ActaCard = ({ acta, onEdit, onDelete }: ActaCardProps) => {
  return (
    <div className="p-6 border rounded-lg shadow bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-lightBlue">
          {acta.residuo} <span className="text-sm">({acta.categoria})</span>
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-300">{acta.fecha}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <p><span className="font-semibold">Nombre:</span> {acta.nombre}</p>
        <p><span className="font-semibold">Cédula:</span> {acta.cedula}</p>
        <p><span className="font-semibold">Sede:</span> {acta.sede}</p>
        <p><span className="font-semibold">Área:</span> {acta.area}</p>
        <p><span className="font-semibold">Procedencia:</span> {acta.procedencia}</p>
        <p><span className="font-semibold">Centro de Costos:</span> {acta.centroCostos}</p>
        <p className="md:col-span-2"><span className="font-semibold">Motivo:</span> {acta.motivo}</p>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => onEdit(acta)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(acta.id)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Borrar
        </button>
      </div>
    </div>
  );
};