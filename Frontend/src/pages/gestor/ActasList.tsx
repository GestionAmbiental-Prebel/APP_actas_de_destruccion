// src/pages/gestor/ActasList.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { exportToExcel } from "../../utils/exportExcel";

// Datos de ejemplo
const mockActas = [
  {
    id: 1,
    nombre: "Juan Pérez",
    cedula: "123456789",
    sede: "Medellín",
    procedencia: "Producción",
    area: "Planta A",
    centroCostos: "CC-1001",
    categoria: "Reciclable",
    residuo: "Papel",
    motivo: "Documentos obsoletos",
    fecha: "2025-01-05",
  },
  {
    id: 2,
    nombre: "Ana Gómez",
    cedula: "987654321",
    sede: "Bogotá",
    procedencia: "Logística",
    area: "Planta B",
    centroCostos: "CC-2001",
    categoria: "Orgánico",
    residuo: "Cartón",
    motivo: "Embalajes dañados",
    fecha: "2025-01-12",
  },
];

export const ActasList = () => {
  const [actas, setActas] = useState(mockActas);
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Filtrar actas
  const actasFiltradas = actas.filter((acta) => {
    const matchResiduo = acta.residuo.toLowerCase().includes(busqueda.toLowerCase());
    const fechaActa = new Date(acta.fecha).getTime();
    const fechaDesde = desde ? new Date(desde).getTime() : null;
    const fechaHasta = hasta ? new Date(hasta).getTime() : null;
    const matchDesde = fechaDesde ? fechaActa >= fechaDesde : true;
    const matchHasta = fechaHasta ? fechaActa <= fechaHasta : true;
    return matchResiduo && matchDesde && matchHasta;
  });

  // Borrar acta
  const handleDelete = (id: number) => {
    if (confirm("¿Deseas borrar esta acta?")) {
      setActas((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Exportar Excel
  const handleExport = () => {
    const excelData = actasFiltradas.map((a) => ({
      ID: a.id,
      Nombre: a.nombre,
      Cédula: a.cedula,
      Sede: a.sede,
      Procedencia: a.procedencia,
      Área: a.area,
      "Centro de Costos": a.centroCostos,
      Categoría: a.categoria,
      Residuo: a.residuo,
      Motivo: a.motivo,
      Fecha: a.fecha,
    }));
    exportToExcel(excelData, "Actas_Gestor");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-acidGrotesk">
      <h2 className="text-2xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        Actas de Destrucción
      </h2>

      {/* Filtros y botones */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por residuo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="p-2 border rounded" />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="p-2 border rounded" />
        <Link to="/gestor/actas/nueva" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Crear Acta
        </Link>
        <button onClick={handleExport} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Exportar Excel
        </button>
      </div>

      {/* Listado */}
      {actasFiltradas.length > 0 ? (
        <div className="grid gap-6">
          {actasFiltradas.map((acta) => (
            <div key={acta.id} className="p-6 border rounded-lg shadow bg-white dark:bg-gray-800">
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
                <Link
                  to={`/gestor/actas/editar/${acta.id}`}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(acta.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          No se encontraron actas con los filtros aplicados.
        </p>
      )}
    </div>
  );
};
