export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard Admin</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">Total actas: 120</div>
        <div className="p-4 bg-white rounded shadow">Residuo más común: Papel</div>
        <div className="p-4 bg-white rounded shadow">Área con más residuos: Producción</div>
      </div>
    </div>
  );
}
