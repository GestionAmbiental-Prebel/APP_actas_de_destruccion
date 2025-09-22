import { useState } from "react";

// 🔹 Componente de tarjeta
const DashboardCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition">
    <h3 className="text-gray-500 dark:text-gray-300 text-sm">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">{value}</p>
  </div>
);

const mockActas = [
  { id: 1, nombre: "Juan Pérez", sede: "Medellín", area: "Planta A", fecha: "2025-01-05", residuos: [{ residuo: "Papel", peso: 5 }, { residuo: "Cartón", peso: 7 }] },
  { id: 2, nombre: "Ana Gómez", sede: "Bogotá", area: "Planta B", fecha: "2025-01-12", residuos: [{ residuo: "Plástico", peso: 4 }, { residuo: "Vidrio", peso: 5 }] },
  { id: 3, nombre: "Carlos López", sede: "Cali", area: "Planta C", fecha: "2025-02-02", residuos: [{ residuo: "Papel", peso: 3 }, { residuo: "Plástico", peso: 6 }] },
];

const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export const Dashboard = () => {
  const [actas] = useState(mockActas);

  // 🔹 Estado de mes y año mostrado en “Actas por mes”
  const today = new Date();
  const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const [mesActual, setMesActual] = useState(prevMonth.getMonth());
  const [anioActual, setAnioActual] = useState(prevMonth.getFullYear());

  // 🔹 Filtrar actas del mes actual
  const actasMes = actas.filter((a) => {
    const f = new Date(a.fecha);
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  });

  // 🔹 Área con más actas
  const areaCount: Record<string, number> = {};
  actasMes.forEach((a) => (areaCount[a.area] = (areaCount[a.area] || 0) + 1));
  const areaTop = Object.entries(areaCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  // 🔹 Peso total de residuos del mes
  const pesoTotalMes = actasMes.reduce(
    (acc, a) => acc + a.residuos.reduce((s, r) => s + r.peso, 0),
    0
  );

  // 🔹 Peso por sede
  const pesoPorSede: Record<string, number> = {};
  actasMes.forEach((a) => {
    const pesoActa = a.residuos.reduce((s, r) => s + r.peso, 0);
    pesoPorSede[a.sede] = (pesoPorSede[a.sede] || 0) + pesoActa;
  });

  // 🔹 Navegación de meses
  const handlePrevMonth = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnioActual(anioActual - 1);
    } else {
      setMesActual(mesActual - 1);
    }
  };

  const handleNextMonth = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual(anioActual + 1);
    } else {
      setMesActual(mesActual + 1);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-acidGrotesk">
      <h1 className="text-3xl font-bold text-cyan-700 mb-6">Dashboard Gestor</h1>

      {/* 🔹 Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <DashboardCard title="Actas registradas este mes" value={actasMes.length} />
        <DashboardCard title="Área con más actas" value={areaTop} />
        <DashboardCard title="Peso total de residuos (kg)" value={pesoTotalMes} />
      </div>

      {/* 🔹 Peso por sede */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-cyan-700">Peso por sede (kg)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(pesoPorSede).map(([sede, peso]) => (
            <div key={sede} className="bg-cyan-50 dark:bg-gray-700 p-3 rounded shadow">
              <p className="font-semibold">{sede}</p>
              <p className="text-lg font-bold">{peso} kg</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Actas registradas por mes con navegación */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-cyan-700">Actas registradas - {monthNames[mesActual]} {anioActual}</h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700">◀ Mes anterior</button>
            <button onClick={handleNextMonth} className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700">Mes siguiente ▶</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actasMes.length > 0 ? (
            actasMes.map((a) => (
              <div key={a.id} className="bg-cyan-50 dark:bg-gray-700 p-3 rounded shadow">
                <p className="font-semibold">Acta #{a.id}</p>
                <p>Nombre: {a.nombre}</p>
                <p>Sede: {a.sede}</p>
                <p>Área: {a.area}</p>
                <p>Peso total residuos: {a.residuos.reduce((s, r) => s + r.peso, 0)} kg</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-300 col-span-full">No hay actas registradas en este mes.</p>
          )}
        </div>
      </div>
    </div>
  );
};
