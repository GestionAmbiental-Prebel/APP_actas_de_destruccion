import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const motivos = ["Vencimiento", "Deterioro", "Devolución", "Exceso de inventario", "Otro"];

// 🔹 Hacemos que la prop sea opcional
interface ActaFormProps {
  onAgregar?: (nuevaActa: any) => void;
}
 
export default function ActaForm({ onAgregar }: ActaFormProps) {
  const { usuario } = useAuth();

  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [centroCostos, setCentroCostos] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [sede, setSede] = useState("Medellín");
  const [residuos, setResiduos] = useState([{ residuo: "", categoria: "", motivo: "", peso: "" }]);
  const [showToast, setShowToast] = useState(false);

  const handleAddResiduo = () => {
    setResiduos([...residuos, { residuo: "", categoria: "", motivo: "", peso: "" }]);
  };

  const handleResiduoChange = (index: number, field: string, value: string) => {
    const updated = [...residuos];
    updated[index] = { ...updated[index], [field]: value };
    setResiduos(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevaActa = {
      id: Date.now(),
      nombre: `${nombre} ${apellido}`,
      cedula,
      sede,
      procedencia,
      area: usuario?.subarea || "Desconocida",
      centroCostos,
      fecha: new Date().toISOString(),
      residuos,
    };

    // 🔹 Guardar en localStorage (modo offline)
    const stored = localStorage.getItem("actas");
    const actas = stored ? JSON.parse(stored) : [];
    actas.push(nuevaActa);
    localStorage.setItem("actas", JSON.stringify(actas));

    // 🔹 Si existe la prop onAgregar, la usamos (cuando esté conectado al back)
    if (onAgregar) onAgregar(nuevaActa);

    // 🔹 Mostrar confirmación
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);

    // 🔹 Resetear formulario
    setCedula("");
    setNombre("");
    setApellido("");
    setCentroCostos("");
    setProcedencia("");
    setResiduos([{ residuo: "", categoria: "", motivo: "", peso: "" }]);
  };

  const inputClasses =
    "p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white w-full focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 outline-none transition";

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-sky-700 dark:text-sky-400 text-center">
        Nueva Acta de Destrucción
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identificación */}
        <div>
          <label className="block mb-1 font-semibold">Cédula</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Apellido</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <label className="block mb-1 font-semibold">Centro de Costos</label>
          <input
            type="text"
            value={centroCostos}
            onChange={(e) => setCentroCostos(e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Procedencia</label>
          <input
            type="text"
            value={procedencia}
            onChange={(e) => setProcedencia(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Residuos */}
        <div>
          <h3 className="text-xl font-semibold text-sky-600 dark:text-sky-400 mb-3">
            Residuos
          </h3>
          {residuos.map((r, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 mb-3">
              <input
                placeholder="Residuo"
                value={r.residuo}
                onChange={(e) => handleResiduoChange(i, "residuo", e.target.value)}
                className={inputClasses}
              />
              <input
                placeholder="Categoría"
                value={r.categoria}
                onChange={(e) => handleResiduoChange(i, "categoria", e.target.value)}
                className={inputClasses}
              />
              <select
                value={r.motivo}
                onChange={(e) => handleResiduoChange(i, "motivo", e.target.value)}
                className={inputClasses}
              >
                <option value="">Motivo</option>
                {motivos.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <input
                placeholder="Peso (kg)"
                type="number"
                value={r.peso}
                onChange={(e) => handleResiduoChange(i, "peso", e.target.value)}
                className={inputClasses}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddResiduo}
            className="text-sky-700 dark:text-sky-400 font-semibold hover:underline mt-2"
          >
            + Agregar residuo
          </button>
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            Guardar Acta
          </button>
        </div>
      </form>

      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4 bg-gradient-to-r from-skyBlue to-lightBlue text-white px-10 py-8 rounded-2xl shadow-2xl animate-fade-in">
            <span className="text-6xl">✅</span>
            <span className="text-2xl font-bold">¡Acta guardada con éxito!</span>
          </div>
        </div>
      )}
    </div>
  );
}
