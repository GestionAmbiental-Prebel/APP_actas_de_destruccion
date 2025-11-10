import { useState, useEffect } from "react";
import SeccionIdentificacion from "../../components/operario/SeccionIdentificacion";
import SeccionUbicacion from "../../components/operario/SeccionUbicacion";
import SeccionResiduos from "../../components/operario/SeccionResiduos";
import { API_URL } from "../../utils/api";

export default function FormularioActa() {
  const perfil = "operario"; // se obtiene del login/contexto

  // Identificación
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  // Ubicación
  const [sede, setSede] = useState("");
  const [sedes, setSedes] = useState<string[]>([]);
  const [procedencia, setProcedencia] = useState("");
  const [area, setArea] = useState("");
  const [areas, setAreas] = useState<any[]>([]);
  const [centroCostos, setCentroCostos] = useState("");
  const [centros, setCentros] = useState<string[]>([]);

  // Residuos
  const [residuos, setResiduos] = useState([
    { residuo: "", categoria: "", motivo: "", peso: "" },
  ]);
  const [motivos, setMotivos] = useState<string[]>([]);

  // UI
  const [showToast, setShowToast] = useState(false);

  // 📦 Cargar datos iniciales desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sedesRes, areasRes, motivosRes] = await Promise.all([
          fetch(`${API_URL}sedes/`),
          fetch(`${API_URL}areas/`),
          fetch(`${API_URL}motivos/`),
        ]);

        const [sedesData, areasData, motivosData] = await Promise.all([
          sedesRes.json(),
          areasRes.json(),
          motivosRes.json(),
        ]);

        setSedes(sedesData);
        setAreas(areasData);
        setMotivos(motivosData);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      }
    };

    fetchData();
  }, []);

  // 🔍 Buscar usuario por cédula
  const handleCedulaBlur = async () => {
    if (!cedula) return;

    try {
      const res = await fetch(`${API_URL}usuarios/${cedula}/`);
      if (res.ok) {
        const data = await res.json();
        setNombre(data.nombre);
        setApellido(data.apellido);
      } else {
        console.warn("Usuario no encontrado");
        setNombre("");
        setApellido("");
      }
    } catch (err) {
      console.error("Error al buscar usuario:", err);
    }
  };

  // 🔄 Cuando cambia el área, actualizar los centros disponibles
  const handleAreaChange = (value: string) => {
    setArea(value);
    const selectedArea = areas.find((a) => a.nombre === value);
    setCentros(selectedArea ? selectedArea.centros : []);
    setCentroCostos("");
  };

  // 💾 Enviar formulario al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      cedula,
      nombre,
      apellido,
      perfil,
      sede,
      procedencia,
      area,
      centro_costos: centroCostos,
      residuos,
    };

    try {
      const response = await fetch(`${API_URL}actas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al guardar el acta:", errorData);
        alert("Hubo un error al guardar el acta. Revisa la consola.");
        return;
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // limpiar form
      setCedula("");
      setNombre("");
      setApellido("");
      setSede("");
      setProcedencia("");
      setArea("");
      setCentroCostos("");
      setResiduos([{ residuo: "", categoria: "", motivo: "", peso: "" }]);
    } catch (err) {
      console.error("Error de conexión:", err);
      alert("No se pudo conectar con el servidor.");
    }
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
          setArea={handleAreaChange}
          centroCostos={centroCostos}
          setCentroCostos={setCentroCostos}
          centros={centros}
          sede={sede}
          setSede={setSede}
          sedes={sedes}
          procedencia={procedencia}
          setProcedencia={setProcedencia}
          inputClasses={inputClasses}
        />

        {/* Residuos */}
        <SeccionResiduos
          perfil={perfil}
          area={area}
          residuos={residuos}
          setResiduos={setResiduos}
          motivos={motivos}
          inputClasses={inputClasses}
        />

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-skyBlue hover:bg-lightBlue dark:bg-lightBlue dark:hover:bg-skyBlue text-white px-8 py-3 rounded shadow transition"
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
