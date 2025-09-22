// src/components/admin/FilterBar.tsx
interface Props {
  onFilter: (filter: any) => void;
}

export const FilterBar = ({ onFilter }: Props) => {
  return (
    <div className="flex gap-2 mb-4">
      <input type="date" onChange={(e) => onFilter({ fecha: e.target.value })} className="p-2 border rounded" />
      <input type="text" placeholder="Residuo" onChange={(e) => onFilter({ residuo: e.target.value })} className="p-2 border rounded" />
      <input type="text" placeholder="Área" onChange={(e) => onFilter({ area: e.target.value })} className="p-2 border rounded" />
      <button onClick={() => onFilter({})} className="px-4 py-2 bg-gray-300 rounded">Limpiar</button>
    </div>
  );
};
