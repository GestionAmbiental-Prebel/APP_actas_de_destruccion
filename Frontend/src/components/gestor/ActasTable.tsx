// src/components/admin/ActasTable.tsx
interface Acta {
  id: number;
  fecha: string;
  residuo: string;
  area: string;
}

interface Props {
  actas: Acta[];
  onEdit: (acta: Acta) => void;
  onDelete: (id: number) => void;
}

export const ActasTable = ({ actas, onEdit, onDelete }: Props) => {
  return (
    <table className="w-full bg-white rounded shadow">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">ID</th>
          <th>Fecha</th>
          <th>Residuo</th>
          <th>Área</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {actas.map((acta) => (
          <tr key={acta.id} className="border-b">
            <td className="p-2">{acta.id}</td>
            <td>{acta.fecha}</td>
            <td>{acta.residuo}</td>
            <td>{acta.area}</td>
            <td>
              <button onClick={() => onEdit(acta)} className="mr-2 text-blue-500">
                Editar
              </button>
              <button onClick={() => onDelete(acta.id)} className="text-red-500">
                Borrar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
