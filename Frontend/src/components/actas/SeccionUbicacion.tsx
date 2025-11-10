type SeccionUbicacionProps = {
  perfil: string;
  area: string;
  setArea: (v: string) => void;
  centroCostos: string;
  setCentroCostos: (v: string) => void;
  sede: string;
  procedencia: string;
  setProcedencia: (v: string) => void;
  data: Record<string, {
    sede: string;
    procedencia: string;
    areas: Record<string, { centros: string[]; residuos: string[]; subAreas: string[] }>
  }>;
  inputClasses: string;
  handleCentroChange: (v: string) => void;
};

export default function SeccionUbicacion({
  perfil, area,
  centroCostos, sede, procedencia, setProcedencia,
  data, inputClasses, handleCentroChange
}: SeccionUbicacionProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
        Ubicación organizacional
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Centro de Costos */}
        <div className="flex flex-col">
          <label>Centro de Costos</label>
          <select
            value={centroCostos}
            onChange={(e) => handleCentroChange(e.target.value)}
            required
            className={inputClasses}
          >
            <option value="">Seleccione centro de costos</option>
            {Object.entries(data[perfil].areas).flatMap(([a, { centros }]) =>
              centros.map((c) => <option key={c} value={c}>{c}</option>)
            )}
          </select>
        </div>

        {/* Área */}
        <div className="flex flex-col">
          <label>Área</label>
          <input type="text" value={area} readOnly className={inputClasses} />
        </div>

        {/* Sub Área */}
        <div className="flex flex-col">
          <label>Sub Área</label>
          <select
            value={procedencia}
            onChange={(e) => setProcedencia(e.target.value)}
            required
            disabled={!area}
            className={inputClasses}
          >
            <option value="">Seleccione sub área</option>
            {area &&
              data[perfil].areas[area].subAreas.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
          </select>
        </div>

        {/* Sede */}
        <div className="flex flex-col">
          <label>Sede</label>
          <input type="text" value={sede} readOnly className={inputClasses} />
        </div>
      </div>
    </div>
  );
}
