import { useState } from "react";
import SeccionIdentificacion from "./SeccionIdentificacion";
import SeccionUbicacion from "./SeccionUbicacion";
import SeccionResiduos from "./SeccionResiduos";

export default function FormularioActa() {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const [area, setArea] = useState("");
  const [centroCostos, setCentroCostos] = useState("");
  const [sede, setSede] = useState("Medellín"); // valor por defecto
  const [procedencia, setProcedencia] = useState("");

  const [residuos, setResiduos] = useState([
    { residuo: "", categoria: "", motivo: "", peso: "" },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      cedula,
      nombre,
      apellido,
      area,
      centroCostos,
      sede,
      procedencia,
      residuos,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 max-w-4xl mx-auto bg-lightBlue/10 dark:bg-gray-800 p-8 rounded-lg shadow-md font-acidGrotesk"
    >
      <h2 className="text-3xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        Nueva Acta de Destrucción
      </h2>

      <SeccionIdentificacion
        cedula={cedula}
        setCedula={setCedula}
        nombre={nombre}
        setNombre={setNombre}
        apellido={apellido}
        setApellido={setApellido}
      />

      <SeccionUbicacion
        area={area}
        setArea={setArea}
        centroCostos={centroCostos}
        setCentroCostos={setCentroCostos}
        sede={sede}
        setSede={setSede}
        procedencia={procedencia}
        setProcedencia={setProcedencia}
      />

      <SeccionResiduos residuos={residuos} setResiduos={setResiduos} />

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-skyBlue hover:bg-lightBlue text-white px-8 py-3 rounded shadow transition"
        >
          Guardar Acta
        </button>
      </div>
    </form>
  );
}
