// src/components/admin/ActaForm.tsx
import { useState, useEffect } from "react";

// 🔹 Datos quemados con dependencias (Admin puede ver todas las áreas)
const data: Record<
  string,
  {
    sede: string;
    procedencia: string;
    areas: Record<
      string,
      { centros: string[]; residuos: string[] }
    >;
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

// 🔹 Opciones de motivo
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
  onSubmit: (data: ActaFormData) => void;
}

export const ActaForm = ({ initialData, onSubmit }: ActaFormProps) => {
  const [perfil, setPerfil] = useState(initialData?.perfil || "");
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [apellido, setApellido] = useState(initialData?.apellido || "");
  const [cedula, setCedula] = useState(initialData?.cedula || "");
  const [area, setArea] = useState(initialData?.area || "");
  const [centroCostos, setCentroCostos] = useState(initialData?.centroCostos || "");
  const [categoria, setCategoria] = useState(initialData?.categoria || "");
  const [residuo, setResiduo] = useState(initialData?.residuo || "");
  const [motivo, setMotivo] = useState(initialData?.motivo || "");
  const [fecha, setFecha] = useState(initialData?.fecha || "");
  const [showToast, setShowToast] = useState(false);

  const perfilData = perfil ? data[perfil] : null;
  const areas = perfilData ? Object.keys(perfilData.areas) : [];
  const centros = perfilData?.areas?.[area]?.centros ?? [];
  const residuos = perfilData?.areas?.[area]?.residuos ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ nombre, apellido, cedula, perfil, area, centroCostos, categoria, residuo, motivo, fecha });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Limpiar formulario
    setNombre("");
    setApellido("");
    setCedula("");
    setPerfil("");
    setArea("");
    setCentroCostos("");
    setCategoria("");
    setResiduo("");
    setMotivo("");
    setFecha("");
  };

  const inputClasses =
    "p-3 border border-skyBlue dark:border-lightBlue rounded focus:ring-2 focus:ring-lightBlue text-skyBlue dark:text-lightBlue placeholder:text-lightBlue/70 dark:placeholder:text-gray-400 bg-white dark:bg-gray-700";

  return (
    <div className="relative max-w-4xl mx-auto bg-lightBlue/10 dark:bg-gray-800 p-8 rounded-lg shadow-md font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-6 text-skyBlue dark:text-lightBlue text-center">
        {initialData ? "Editar Acta" : "Nueva Acta de Destrucción"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Nombre</label>
          <input type="text" required placeholder="Ingrese nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClasses} />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Apellido</label>
          <input type="text" required placeholder="Ingrese apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} className={inputClasses} />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Cédula</label>
          <input type="text" required placeholder="Ingrese cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} className={inputClasses} />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Perfil</label>
          <select
            required
            value={perfil}
            onChange={(e) => {
              setPerfil(e.target.value);
              setArea("");
              setCentroCostos("");
              setResiduo("");
            }}
            className={inputClasses}
          >
            <option value="">Seleccione perfil</option>
            {Object.keys(data).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Área</label>
          <select
            required
            value={area}
            onChange={(e) => { setArea(e.target.value); setCentroCostos(""); setResiduo(""); }}
            className={inputClasses}
            disabled={!perfil}
          >
            <option value="">Seleccione área</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Centro de Costos</label>
          <select required value={centroCostos} onChange={(e) => setCentroCostos(e.target.value)} className={inputClasses} disabled={!area}>
            <option value="">Seleccione centro de costos</option>
            {centros.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Residuo específico</label>
          <select required value={residuo} onChange={(e) => setResiduo(e.target.value)} className={inputClasses} disabled={!area}>
            <option value="">Seleccione residuo</option>
            {residuos.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Categoría de residuo</label>
          <select required value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClasses}>
            <option value="">Seleccione categoría</option>
            <option value="peligroso">Peligroso</option>
            <option value="noPeligroso">No peligroso</option>
            <option value="reciclable">Reciclable</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Fecha</label>
          <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClasses} />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium text-skyBlue dark:text-lightBlue">Motivo del residuo</label>
          <select required value={motivo} onChange={(e) => setMotivo(e.target.value)} className={inputClasses}>
            <option value="">Seleccione motivo</option>
            {motivos.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-center mt-4">
          <button type="submit" className="bg-skyBlue hover:bg-lightBlue dark:bg-lightBlue dark:hover:bg-skyBlue text-white px-8 py-3 rounded shadow transition">
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
