// src/pages/operario/FormularioActa.tsx
import { useState } from "react";
import SeccionIdentificacion from "../../components/form/SeccionIdentificacion";
import SeccionUbicacion from "../../components/form/SeccionUbicacion";
import SeccionResiduos from "../../components/form/SeccionResiduos";

const data = {
  operario: {
    sede: "Medellín",
    procedencia: "Planta Principal",
    areas: {
      Producción: {
        centros: ["Línea A", "Línea B"],
        residuos: ["Plásticos", "Metales"],
        subAreas: ["Montaje", "Empaque"],
      },
      Logística: {
        centros: ["Transporte", "Almacén"],
        residuos: ["Cajas", "Embalajes"],
        subAreas: ["Recepción", "Despacho"],
      },
    },
  },
};

const motivos = [
  "Vencimiento",
  "Deterioro",
  "Devolución",
  "Exceso de inventario",
  "Otro",
];

export default function FormularioActa() {
  const perfil = "operario"; // se obtiene del login/contexto

  // Identificación
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  // Ubicación
  const [area, setArea] = useState("");
  const [centroCostos, setCentroCostos] = useState("");
  const [sede, setSede] = useState(data[perfil].sede);
  const [procedencia, setProcedencia] = useState("");

  // Residuos
  const [residuos, setResiduos] = useState([
    { residuo: "", categoria: "", motivo: "", peso: "" },
  ]);

  // Toast
  const [showToast, setShowToast] = useState(false);

  // Fake usuarios para demo
  const fakeUsuarios: Record<string, { nombre: string; apellido: string }> = {
    "123": { nombre: "Carlos", apellido: "Ramírez" },
    "456": { nombre: "Ana", apellido: "Gómez" },
  };

  const handleCedulaBlur = () => {
    if (fakeUsuarios[cedula]) {
      setNombre(fakeUsuarios[cedula].nombre);
      setApellido(fakeUsuarios[cedula].apellido);
    }
  };

  const handleCentroChange = (value: string) => {
    setCentroCostos(value);
    const areaEncontrada = Object.entries(data[perfil].areas).find(([_, { centros }]) =>
      centros.includes(value)
    );
    setArea(areaEncontrada ? areaEncontrada[0] : "");
    setProcedencia("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      cedula,
      nombre,
      apellido,
      perfil,
      centroCostos,
      sede,
      procedencia,
      area,
      residuos,
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // limpiar form
    setCedula("");
    setNombre("");
    setApellido("");
    setCentroCostos("");
    setSede(data[perfil].sede);
    setProcedencia("");
    setArea("");
    setResiduos([{ residuo: "", categoria: "", motivo: "", peso: "" }]);
  };

  const inputClasses =
    "p-3 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue transition";

  return (
    <div className="relative max-w-4xl mx-auto bg-lightBlue/10 dark:bg-gray-800 p-8 rounded-lg shadow-md font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        Nueva Acta de Destrucción
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identificación */}
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

        {/* Ubicación */}
        <SeccionUbicacion
          perfil={perfil}
          area={area}
          setArea={setArea}
          centroCostos={centroCostos}
          setCentroCostos={setCentroCostos}
          sede={sede}
          procedencia={procedencia}
          setProcedencia={setProcedencia}
          data={data}
          handleCentroChange={handleCentroChange}
          inputClasses={inputClasses}
        />

        {/* Residuos */}
        <SeccionResiduos
          perfil={perfil}
          area={area}
          residuos={residuos}
          setResiduos={setResiduos}
          data={data}
          motivos={motivos}
          inputClasses={inputClasses}
        />

        {/* Botón principal */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-skyBlue hover:bg-lightBlue dark:bg-lightBlue dark:hover:bg-skyBlue text-white px-8 py-3 rounded shadow transition"
          >
            Guardar Acta
          </button>
        </div>
      </form>

      {/* Toast */}
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
