import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { exportToExcel } from "../../utils/exportExcel";
import { ActasGrid } from "./ActasGrid";

export interface Acta {
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

interface ActasListProps {
  initialActas?: Acta[];
  createLink?: string; // ruta del botón "Crear Acta"
  excelFileName?: string; // nombre del archivo Excel
  editLinkPrefix?: string; // ruta para editar acta
}

export const ActasList = ({
  initialActas = [],
  createLink = "/gestor/actas/nueva",
  excelFileName = "Actas_Gestor",
  editLinkPrefix = "/gestor/actas/editar",
}: ActasListProps) => {
  const [actas, setActas] = useState(initialActas);
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const navigate = useNavigate();

  const actasFiltradas = actas.filter((acta) => {
    const matchResiduo = acta.residuo.toLowerCase().includes(busqueda.toLowerCase());
    const fechaActa = new Date(acta.fecha).getTime();
    const fechaDesde = desde ? new Date(desde).getTime() : null;
    const fechaHasta = hasta ? new Date(hasta).getTime() : null;
    return matchResiduo && (!fechaDesde || fechaActa >= fechaDesde) && (!fechaHasta || fechaActa <= fechaHasta);
  });

  const handleDelete = (id: number) => {
    if (confirm("¿Deseas borrar esta acta?")) {
      setActas((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleEdit = (acta: Acta) => {
    navigate(`${editLinkPrefix}/${acta.id}`);
  };

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
    exportToExcel(excelData, excelFileName);
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
        {createLink && (
          <Link to={createLink} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Crear Acta
          </Link>
        )}
        <button onClick={handleExport} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Exportar Excel
        </button>
      </div>

      {/* Listado */}
      <ActasGrid actas={actasFiltradas} onDelete={handleDelete} onEdit={handleEdit} />
    </div>
  );
};
