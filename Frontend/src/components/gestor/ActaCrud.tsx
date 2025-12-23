// src/components/gestor/ActaCrud.tsx
import { useState, useEffect } from "react";

const data: Record<
  string,
  {
    sede: string;
    procedencia: string;
    areas: Record<string, { centros: string[]; residuos: string[] }>;
  }
> = {
  administrativo: {
    sede: "Bogotá",
    procedencia: "Oficina Central",
    areas: {
      Finanzas: { centros: ["Contabilidad", "Tesorería"], residuos: ["Papelería", "Archivos"] },
      TalentoHumano: { centros: ["Bienestar", "Selección"], residuos: ["Hojas de vida", "Formatos"] },
    },
  },
  operaciones: {
    sede: "Medellín",
    procedencia: "Planta Principal",
    areas: {
      Producción: { centros: ["Línea A", "Línea B"], residuos: ["Plásticos", "Metales"] },
      Logística: { centros: ["Transporte", "Almacén"], residuos: ["Cajas", "Embalajes"] },
    },
  },
};

const motivos = ["Vencimiento", "Deterioro", "Devolución", "Exceso de inventario", "Otro"];

export interface ActaFormData {
  nombre: string;
  apellido: string;
  cedula: string;
  perfil: string;
  area: string;
  centroCostos: string;
  categoria: string;
  residuo: string;
  motivo: string;
  fecha: string;
}

interface ActaFormProps {
  initialData?: Partial<ActaFormData>;
  onSubmit: (data: ActaFormData) => void | Promise<void>;
  userPerfil?: string; // perfil detectado por sesión (opcional)
  onSaved?: () => void; // callback que se ejecuta después de que el toast desaparezca
}

export const ActaCrud = ({ initialData, onSubmit, userPerfil, onSaved }: ActaFormProps) => {
  // PERFIL: use initialData.perfil || userPerfil || fallback (primer key de data)
  const initialPerfil = initialData?.perfil || userPerfil || Object.keys(data)[0] || "";

  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [apellido, setApellido] = useState(initialData?.apellido || "");
  const [cedula, setCedula] = useState(initialData?.cedula || "");
  const [perfil, setPerfil] = useState(initialPerfil); // no editable en formulario (provisionado por sesión)
  const [area, setArea] = useState(initialData?.area || "");
  const [centroCostos, setCentroCostos] = useState(initialData?.centroCostos || "");
  const [categoria, setCategoria] = useState(initialData?.categoria || "");
  const [residuo, setResiduo] = useState(initialData?.residuo || "");
  const [motivo, setMotivo] = useState(initialData?.motivo || "");
  const [fecha, setFecha] = useState(initialData?.fecha || "");
  const [showToast, setShowToast] = useState(false);

  // Si initialData o userPerfil cambian (por ejemplo cargan async), sincronizamos estados
  useEffect(() => {
    setNombre(initialData?.nombre || "");
    setApellido(initialData?.apellido || "");
    setCedula(initialData?.cedula || "");
    setPerfil(initialData?.perfil || userPerfil || Object.keys(data)[0] || "");
    setArea(initialData?.area || "");
    setCentroCostos(initialData?.centroCostos || "");
    setCategoria(initialData?.categoria || "");
    setResiduo(initialData?.residuo || "");
    setMotivo(initialData?.motivo || "");
    setFecha(initialData?.fecha || "");
  }, [initialData, userPerfil]);

  // Computar selects dependientes en base a `perfil` y `area`
  const perfilData = perfil ? data[perfil] : null;
  const areas = perfilData ? Object.keys(perfilData.areas) : [];
  const centros = perfilData?.areas?.[area]?.centros ?? [];
  const residuos = perfilData?.areas?.[area]?.residuos ?? [];

  // Si el perfil/area actuales no contienen los valores previos, los limpiamos
  useEffect(() => {
    if (area && !areas.includes(area)) setArea("");
    if (centroCostos && !centros.includes(centroCostos)) setCentroCostos("");
    if (residuo && !residuos.includes(residuo)) setResiduo("");
  }, [perfil, area, areas, centros, residuos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Llamar al onSubmit (soporta sync o async). Esperamos su resolución.
    try {
      await Promise.resolve(
        onSubmit({
          nombre,
          apellido,
          cedula,
          perfil,
          area,
          centroCostos,
          categoria,
          residuo,
          motivo,
          fecha,
        })
      );

      // mostrar toast sólo si el submit fue exitoso
      setShowToast(true);

      // limpiar solo si es creación
      if (!initialData) {
        setNombre("");
        setApellido("");
        setCedula("");
        setArea("");
        setCentroCostos("");
        setCategoria("");
        setResiduo("");
        setMotivo("");
        setFecha("");
      }
    } catch (err) {
      // Aquí puedes mostrar un toast de error o manejar el error.
      console.error("Error guardando acta:", err);
      // (opcional) mostrar un toast de error distinto
      // setShowErrorToast(true);
    }
  };

  // Auto-ocultar toast y llamar onSaved después de que desaparezca (si viene)
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => {
      setShowToast(false);
      if (onSaved) onSaved();
    }, 3000);
    return () => clearTimeout(t);
  }, [showToast, onSaved]);

  const inputClasses =
    "p-3 border border-skyBlue dark:border-lightBlue rounded focus:ring-2 focus:ring-lightBlue text-skyBlue dark:text-lightBlue placeholder:text-lightBlue/70 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-lightBlue/10 dark:bg-gray-800 rounded-lg shadow-md font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-center text-skyBlue dark:text-lightBlue">
        {initialData ? "Editar Acta" : "Nueva Acta de Destrucción"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Nombre</label>
          <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClasses} />
        </div>

        {/* Apellido */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Apellido</label>
          <input type="text" required value={apellido} onChange={(e) => setApellido(e.target.value)} className={inputClasses} />
        </div>

        {/* Cédula */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Cédula</label>
          <input type="text" required value={cedula} onChange={(e) => setCedula(e.target.value)} className={inputClasses} />
        </div>

        {/* Área (no depende visualmente del select de perfil ya que perfil viene por props/session) */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Área</label>
          <select
            required
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setCentroCostos("");
              setResiduo("");
            }}
            className={inputClasses}
            disabled={!perfil}
          >
            <option value="">Seleccione área</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Centro de costos */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Centro de Costos</label>
          <select required value={centroCostos} onChange={(e) => setCentroCostos(e.target.value)} className={inputClasses} disabled={!area}>
            <option value="">Seleccione centro de costos</option>
            {centros.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Residuo */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Residuo específico</label>
          <select required value={residuo} onChange={(e) => setResiduo(e.target.value)} className={inputClasses} disabled={!area}>
            <option value="">Seleccione residuo</option>
            {residuos.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Categoría de residuo</label>
          <select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClasses}>
            <option value="">Seleccione categoría</option>
            <option value="peligroso">Peligroso</option>
            <option value="noPeligroso">No peligroso</option>
            <option value="reciclable">Reciclable</option>
          </select>
        </div>

        {/* Fecha */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Fecha</label>
          <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClasses} />
        </div>

        {/* Motivo */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Motivo del residuo</label>
          <select required value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputClasses}>
            <option value="">Seleccione motivo</option>
            {motivos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-center mt-4">
          <button type="submit" className="bg-skyBlue hover:bg-lightBlue dark:bg-lightBlue dark:hover:bg-skyBlue text-white px-8 py-3 rounded shadow transition">
            Guardar Acta
          </button>
        </div>
      </form>

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3 bg-gradient-to-r from-skyBlue to-lightBlue text-white px-6 py-4 rounded-lg shadow-lg animate-fade-in">
            <span className="text-2xl">✅</span>
            <span className="font-bold">{initialData ? "¡Acta actualizada con éxito!" : "¡Acta guardada con éxito!"}</span>
          </div>
        </div>
      )}
    </div>
  );
};