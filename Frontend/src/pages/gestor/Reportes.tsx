// src/pages/admin/Reportes.tsx
import { useState } from "react";
import { ReportChart } from "../../components/gestor/ReportChart";
import { FilterBar } from "../../components/gestor/FilterBar";
import { exportToExcel } from "../../utils/exportExcel";

export const Reportes = () => {
  const [filter, setFilter] = useState({});

  // Datos de ejemplo
  const data = [
    { name: "Papel", total: 20 },
    { name: "Plástico", total: 5 },
    { name: "Vidrio", total: 2 },
  ];

  // Mapear datos para exportar
  const excelData = data.map((d) => ({
    Residuo: d.name,
    Total: d.total,
  }));

  return (
    <div>
      <FilterBar onFilter={(f) => setFilter(f)} />

      <div className="flex gap-2 my-2">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => exportToExcel(excelData, "Reporte_Residuo")}
        >
          Exportar Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportChart data={data} type="bar" title="Residuo más destruido" />
        <ReportChart data={data} type="pie" title="Distribución por área" />
      </div>
    </div>
  );
};
