import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

// Componentes de secciones
import SeccionIdentificacion from "../../components/actas/SeccionIdentificacion";
import SeccionUbicacion from "../../components/actas/SeccionUbicacion";
import SeccionResiduos from "../../components/actas/SeccionResiduos";

const motivos = ["Vencimiento", "Deterioro", "Devolución", "Exceso de inventario", "Otro"];

export const SubareaPage = () => {
  const { usuario } = useAuth();
  const perfil = "subarea";

  // Identificación
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  // Ubicación
  const [area, setArea] = useState("");
  const [centroCostos, setCentroCostos] = useState("");
  const [sede, setSede] = useState("Medellín");
  const [procedencia, setProcedencia] = useState("");

  // Residuos
  const [residuos, setResiduos] = useState([{ residuo: "", categoria: "", motivo: "", peso: "" }]);

  const [showToast, setShowToast] = useState(false);

  const inputClasses =
    "p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white w-full focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 outline-none transition";

  const handleCedulaBlur = () => {
    // Aquí se podrían traer datos desde un "fake user" o API
    if (cedula === "123") setNombre("Carlos");
    if (cedula === "456") setNombre("Ana");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevaActa = {
      cedula,
      nombre,
      apellido,
      sede,
      procedencia,
      area,
      centroCostos,
      residuos,
    };

    console.log("Nueva acta:", nuevaActa);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);

    // Reset form
    setCedula("");
    setNombre("");
    setApellido("");
    setArea("");
    setCentroCostos("");
    setProcedencia("");
    setResiduos([{ residuo: "", categoria: "", motivo: "", peso: "" }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-sky-700 dark:text-sky-400 mb-6">
          Registrar Acta de Destrucción - {usuario?.subarea || "Subárea"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SeccionIdentificacion
            cedula={cedula}
            setCedula={setCedula}
            nombre={nombre}
            setNombre={setNombre}
            apellido={apellido}
            setApellido={setApellido}
            onCedulaBlur={handleCedulaBlur}
            inputClasses={inputClasses}
          />

          <SeccionUbicacion
            perfil={perfil}
            area={area}
            setArea={setArea}
            centroCostos={centroCostos}
            setCentroCostos={setCentroCostos}
            sede={sede}
            procedencia={procedencia}
            setProcedencia={setProcedencia}
            data={{
              subarea: {
                sede: "Medellín",
                procedencia: "",
                areas: {
                  Producción: {
                    centros: ["Línea A", "Línea B"],
                    residuos: ["Plásticos", "Metales"],
                    subAreas: ["Montaje", "Empaque"],
                  },
                  Calidad: {
                    centros: ["Control", "Laboratorio"],
                    residuos: ["Reactivos", "Desechos"],
                    subAreas: ["Pruebas", "Verificación"],
                  },
                },
              },
            }}
            handleCentroChange={setCentroCostos}
            inputClasses={inputClasses}
          />

          <SeccionResiduos
            perfil={perfil}
            area={area}
            residuos={residuos}
            setResiduos={setResiduos}
            data={{
              subarea: {
                areas: {
                  Producción: { residuos: ["Plásticos", "Metales"] },
                  Calidad: { residuos: ["Reactivos", "Desechos"] },
                },
              },
            }}
            motivos={motivos}
            inputClasses={inputClasses}
          />

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-sky-700 hover:bg-sky-600 text-white px-8 py-3 rounded-xl shadow transition"
            >
              Guardar Acta
            </button>
          </div>
        </form>

        {showToast && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white px-10 py-8 rounded-2xl shadow-2xl animate-fade-in">
              <span className="text-6xl">✅</span>
              <span className="text-2xl font-bold">¡Acta guardada con éxito!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
