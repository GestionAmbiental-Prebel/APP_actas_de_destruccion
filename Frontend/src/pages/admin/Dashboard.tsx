// src/pages/admin/Dashboard.tsx
import { DashboardCard } from "../../components/admin/DashboardCard";

export const Dashboard = () => {
  // Datos de ejemplo, luego se reemplaza con API
  const metrics = [
    { title: "Total Actas", value: 45 },
    { title: "Residuo más destruido", value: "Papel" },
    { title: "Área con más actas", value: "Producción" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <DashboardCard key={metric.title} title={metric.title} value={metric.value} />
      ))}
    </div>
  );
};
