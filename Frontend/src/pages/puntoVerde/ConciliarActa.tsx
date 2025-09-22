// src/pages/operario/ConciliarActa.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

// 🔹 Mock para cargar datos de acta (mismo formato que ActasOperarioPuntoVerde)
const mockActas = [
  {
    id: 1,
    nombre: "Juan Pérez",
    cedula: "123456789",
    sede: "Medellín",
    procedencia: "Producción",
    area: "Planta A",
    centroCostos: "CC-1001",
    fecha: "2025-01-05",
    residuos: [
      { residuo: "Papel", categoria: "Reciclable", motivo: "Documentos obsoletos", peso: 5 },
      { residuo: "Plástico", categoria: "Reciclable", motivo: "Envases dañados", peso: 7 },
    ],
  },
];

export const ConciliarActa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [docConciliador, setDocConciliador] = useState("");
  const [pesoConciliado, setPesoConciliado] = useState("");

  const acta = mockActas.find((a) => a.id.toString() === id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      actaId: id,
      documento: docConciliador,
      pesoConciliado,
    });
    alert("Conciliación guardada con éxito ✅");
    navigate("/operario/punto-verde/actas");
  };

  if (!acta) {
    return <p className="text-center text-gray-500 mt-10">Acta no encontrada</p>;
  }

  const pesoOriginal = acta.residuos.reduce((acc, r) => acc + Number(r.peso || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-6 font-acidGrotesk">
      <h2 className="text-2xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        Conciliar Acta #{acta.id}
      </h2>

      {/* Info general del acta */}
      <div className="bg-lightBlue/10 dark:bg-gray-800 p-4 rounded-lg mb-6 text-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <p><span className="font-semibold">Nombre:</span> {acta.nombre}</p>
          <p><span className="font-semibold">Cédula:</span> {acta.cedula}</p>
          <p><span className="font-semibold">Sede:</span> {acta.sede}</p>
          <p><span className="font-semibold">Área:</span> {acta.area}</p>
          <p><span className="font-semibold">Procedencia:</span> {acta.procedencia}</p>
          <p><span className="font-semibold">Centro de Costos:</span> {acta.centroCostos}</p>
          <p><span className="font-semibold">Fecha:</span> {acta.fecha}</p>
          <p><span className="font-semibold">Peso registrado:</span> {pesoOriginal} kg</p>
        </div>
      </div>

      {/* Tabla de residuos */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2 text-skyBlue dark:text-lightBlue">
          Residuos registrados:
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-skyBlue dark:border-lightBlue rounded-lg">
            <thead className="bg-skyBlue/10 dark:bg-gray-700">
              <tr>
                <th className="p-2 text-left">Residuo</th>
                <th className="p-2 text-left">Categoría</th>
                <th className="p-2 text-left">Motivo</th>
                <th className="p-2 text-left">Peso (kg)</th>
              </tr>
            </thead>
            <tbody>
              {acta.residuos.map((r, idx) => (
                <tr key={idx} className="border-t border-skyBlue/30 dark:border-lightBlue/30">
                  <td className="p-2">{r.residuo}</td>
                  <td className="p-2">{r.categoria}</td>
                  <td className="p-2">{r.motivo}</td>
                  <td className="p-2">{r.peso}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-skyBlue/5 dark:bg-gray-700">
                <td colSpan={3} className="p-2 text-right">Total peso:</td>
                <td className="p-2">{pesoOriginal} kg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario de conciliación */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">
            Documento conciliador
          </label>
          <input
            type="text"
            value={docConciliador}
            onChange={(e) => setDocConciliador(e.target.value)}
            required
            className="p-3 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-700 text-skyBlue dark:text-lightBlue"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">
            Peso conciliado (kg)
          </label>
          <input
            type="number"
            value={pesoConciliado}
            onChange={(e) => setPesoConciliado(e.target.value)}
            required
            className="p-3 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-700 text-skyBlue dark:text-lightBlue"
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-skyBlue hover:bg-lightBlue text-white px-6 py-2 rounded shadow transition"
          >
            Guardar Conciliación
          </button>
        </div>
      </form>
    </div>
  );
};
