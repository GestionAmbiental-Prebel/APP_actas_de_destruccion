// src/pages/operario/FormularioActa.tsx
import { useState } from "react";

const data: Record<
  string,
  {
    sede: string;
    procedencia: string;
    areas: Record<
      string,
      { centros: string[]; residuos: string[]; subAreas: string[] }
    >;
  }
> = {
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

export const FormularioActa = () => {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");

  const perfil = "operario"; // se obtiene del login/contexto
  const [area, setArea] = useState("");
  const [centroCostos, setCentroCostos] = useState("");
  const [sede, setSede] = useState(data[perfil].sede);
  const [procedencia, setProcedencia] = useState("");

  const [residuos, setResiduos] = useState([
    { residuo: "", categoria: "", motivo: "", peso: "" },
  ]);
  const [showToast, setShowToast] = useState(false);

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

    for (const areaKey in data[perfil].areas) {
      if (data[perfil].areas[areaKey].centros.includes(value)) {
        setArea(areaKey);
        setSede(data[perfil].sede);
        setProcedencia("");
      }
    }
  };

  const handleResiduoChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const nuevos = [...residuos];
    nuevos[index] = { ...nuevos[index], [field]: value };
    setResiduos(nuevos);
  };

  const agregarResiduo = () => {
    setResiduos([
      ...residuos,
      { residuo: "", categoria: "", motivo: "", peso: "" },
    ]);
  };

  const eliminarResiduo = (index: number) => {
    setResiduos(residuos.filter((_, i) => i !== index));
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

    // Limpiar
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
    "p-3 border border-skyBlue dark:border-lightBlue rounded focus:ring-2 focus:ring-lightBlue text-skyBlue dark:text-lightBlue placeholder:text-lightBlue/70 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700";

  return (
    <div className="relative max-w-4xl mx-auto bg-lightBlue/10 dark:bg-gray-800 p-8 rounded-lg shadow-md font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        Nueva Acta de Destrucción
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identificación */}
  <div>
    <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
      Identificación
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cédula */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Cédula</label>
        <input
          type="text"
          inputMode="numeric"
          value={cedula}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
            setCedula(value);
          }}
          onBlur={handleCedulaBlur}
          required
          className={inputClasses}
        />
      </div>

      {/* Nombre */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => {
            const value = e.target.value
              .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "")
              .slice(0, 50);
            setNombre(value);
          }}
          required
          className={inputClasses}
        />
      </div>

      {/* Apellido */}
      <div className="flex flex-col">
        <label className="mb-1 font-medium">Apellido</label>
        <input
          type="text"
          value={apellido}
          onChange={(e) => {
            const value = e.target.value
              .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "")
              .slice(0, 50);
            setApellido(value);
          }}
          required
          className={inputClasses}
        />
      </div>
    </div>
  </div>

        {/* Ubicación organizacional */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
            Ubicación organizacional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Centro de costos */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Centro de Costos</label>
              <select
                value={centroCostos}
                onChange={(e) => handleCentroChange(e.target.value)}
                required
                className={inputClasses}
              >
                <option value="">Seleccione centro de costos</option>
                {Object.entries(data[perfil].areas).flatMap(([a, { centros }]) =>
                  centros.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Área */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Área</label>
              <input type="text" value={area} readOnly className={inputClasses} />
            </div>

            {/* Sub Área */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Sub Área</label>
              <select
                value={procedencia}
                onChange={(e) => setProcedencia(e.target.value)}
                required
                disabled={!area}
                className={inputClasses}
              >
                <option value="">Seleccione sub área</option>
                {area &&
                  data[perfil].areas[area].subAreas.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sede */}
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Sede</label>
              <input type="text" value={sede} readOnly className={inputClasses} />
            </div>
          </div>
        </div>

        {/* Residuos */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">Residuos</h3>

          {residuos.map((item, index) => (
            <div key={index} className="border p-4 rounded-lg mb-4 bg-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label>Residuo</label>
                  <select
                    value={item.residuo}
                    onChange={(e) => handleResiduoChange(index, "residuo", e.target.value)}
                    required
                    disabled={!area}
                    className={inputClasses}
                  >
                    <option value="">Seleccione residuo</option>
                    {perfil && area &&
                      data[perfil].areas[area].residuos.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-col">
                  <label>Categoría</label>
                  <select
                    value={item.categoria}
                    onChange={(e) => handleResiduoChange(index, "categoria", e.target.value)}
                    required
                    className={inputClasses}
                  >
                    <option value="">Seleccione categoría</option>
                    <option value="peligroso">Peligroso</option>
                    <option value="noPeligroso">No peligroso</option>
                    <option value="reciclable">Reciclable</option>
                  </select>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label>Motivo</label>
                  <select
                    value={item.motivo}
                    onChange={(e) => handleResiduoChange(index, "motivo", e.target.value)}
                    required
                    className={inputClasses}
                  >
                    <option value="">Seleccione motivo</option>
                    {motivos.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label>Peso (kg)</label>
                  <input
                    type="number"
                    value={item.peso}
                    onChange={(e) => handleResiduoChange(index, "peso", e.target.value)}
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              {residuos.length > 1 && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => eliminarResiduo(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Eliminar residuo
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={agregarResiduo}
            className="mt-2 bg-lightBlue text-white px-4 py-2 rounded shadow hover:bg-skyBlue transition"
          >
            ➕ Agregar residuo
          </button>
        </div>

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
};
