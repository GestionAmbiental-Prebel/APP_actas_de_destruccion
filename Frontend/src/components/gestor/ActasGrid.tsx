// src/components/gestor/ActasGrid.tsx
import { ActaCard } from "./ActaCard";

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

interface Props {
  actas: Acta[];
  onEdit: (acta: Acta) => void;
  onDelete: (id: number) => void;
}

export const ActasGrid = ({ actas, onEdit, onDelete }: Props) => {
  if (actas.length === 0)
    return <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
      No se encontraron actas con los filtros aplicados.
    </p>;

  return (
    <div className="grid gap-6">
      {actas.map((acta) => (
        <ActaCard 
          key={acta.id} 
          acta={acta} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
