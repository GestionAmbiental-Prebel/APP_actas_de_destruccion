// src/pages/operario/ActasOperario.tsx
const mockActas = [
  { id: 1, residuo: "Papel", fecha: "2025-01-10" },
  { id: 2, residuo: "Cartón", fecha: "2025-01-12" },
];

export const ActasOperario = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mis Actas</h2>
      <ul className="space-y-2">
        {mockActas.map(acta => (
          <li key={acta.id} className="p-2 border rounded">
            {acta.residuo} - {acta.fecha}
          </li>
        ))}
      </ul>
    </div>
  );
};
