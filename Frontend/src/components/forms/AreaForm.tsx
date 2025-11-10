// src/components/forms/AreaForm.tsx

import { useState } from "react";

interface AreaFormProps {
  usuarioActual: string;
  data: Record<string, any>;
  motivos: string[];
  onSubmit: (formData: any) => void;
  onCancel?: () => void;
}

const USUARIOS_ESPECIALES = ["DISNAL", "AYT", "Mantenimiento", "Envasado", "Manufactura"];

export default function AreaForm({
  usuarioActual,
  data,
  motivos,
  onSubmit,
  onCancel,
}: AreaFormProps) {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [centroCostos, setCentroCostos] = useState("");
  const [area, setArea] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [sede, setSede] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [residuos, setResiduos] = useState([
    { residuo: "", categoria: "", motivo: "", peso: "", lote: "" },
  ]);

  const esEspecial = USUARIOS_ESPECIALES.includes(usuarioActual);

  const inputClasses =
    "border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-skyBlue focus:outline-none";

  const handleResiduoChange = (index: number, field: string, value: string) => {
    const nuevos = [...residuos];
    nuevos[index] = { ...nuevos[index], [field]: value };
    setResiduos(nuevos);
  };

  const agregarResiduo = () => {
    setResiduos([
      ...residuos,
      { residuo: "", categoria: "", motivo: "", peso: "", lote: "" },
    ]);
  };

  const eliminarResiduo = (index: number) => {
    setResiduos(residuos.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cedula || !nombre || !apellido || !centroCostos) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (usuarioActual === "Envasado") {
      for (const r of residuos) {
        if (!r.lote) {
          alert("Debe ingresar número de lote para cada residuo.");
          return;
        }
      }
    }

    onSubmit({
      cedula,
      nombre,
      apellido,
      area,
      centroCostos,
      procedencia,
      sede,
      residuos,
      observaciones,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Sección: Identificación */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
          Identificación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label>Cédula</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label>Apellido</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
        </div>
      </section>

      {/* Sección: Ubicación */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
          Ubicación organizacional
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label>Centro de Costos</label>
            <select
              value={centroCostos}
              onChange={(e) => setCentroCostos(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="">Seleccione centro de costos</option>
              {Object.entries(data[usuarioActual]?.areas || {}).flatMap(([a, { centros }]: any) =>
                centros.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label>Área</label>
            <input type="text" value={area} readOnly className={inputClasses} />
          </div>

          <div>
            <label>Sub Área</label>
            <select
              value={procedencia}
              onChange={(e) => setProcedencia(e.target.value)}
              className={inputClasses}
            >
              <option value="">Seleccione sub área</option>
              {area &&
                data[usuarioActual]?.areas?.[area]?.subAreas?.map((s: string) => (
                  <option key={s}>{s}</option>
                ))}
            </select>
          </div>

          <div>
            <label>Sede</label>
            <input type="text" value={sede} readOnly className={inputClasses} />
          </div>
        </div>
      </section>

      {/* Sección: Residuos */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
          Residuos
        </h3>
        {residuos.map((item, index) => (
          <div key={index} className="border p-4 rounded-lg mb-4 bg-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label>Residuo</label>
                <select
                  value={item.residuo}
                  onChange={(e) => handleResiduoChange(index, "residuo", e.target.value)}
                  className={inputClasses}
                >
                  <option value="">Seleccione residuo</option>
                  {data[usuarioActual]?.areas?.[area]?.residuos?.map((r: string) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Categoría</label>
                <select
                  value={item.categoria}
                  onChange={(e) => handleResiduoChange(index, "categoria", e.target.value)}
                  className={inputClasses}
                >
                  <option value="">Seleccione categoría</option>
                  <option value="peligroso">Peligroso</option>
                  <option value="noPeligroso">No peligroso</option>
                  <option value="reciclable">Reciclable</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label>Motivo</label>
                <select
                  value={item.motivo}
                  onChange={(e) => handleResiduoChange(index, "motivo", e.target.value)}
                  className={inputClasses}
                >
                  <option value="">Seleccione motivo</option>
                  {motivos.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label>Peso (kg)</label>
                <input
                  type="number"
                  value={item.peso}
                  onChange={(e) => handleResiduoChange(index, "peso", e.target.value)}
                  className={inputClasses}
                />
              </div>

              {usuarioActual === "Envasado" && (
                <div className="md:col-span-2">
                  <label>Número de lote</label>
                  <input
                    type="text"
                    value={item.lote}
                    onChange={(e) => handleResiduoChange(index, "lote", e.target.value)}
                    className={inputClasses}
                    placeholder="Ej: L-2025-01"
                  />
                </div>
              )}
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
          Agregar residuo
        </button>
      </section>

      {/* Sección: Observaciones adicionales (usuarios especiales) */}
      {esEspecial && (
        <section>
          <label>Observaciones adicionales</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className={inputClasses}
          />
        </section>
      )}

      {/* Acciones */}
      <div className="flex justify-end gap-4 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-skyBlue text-white rounded hover:bg-lightBlue transition"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
