type Residuo = { residuo: string; categoria: string; motivo: string; peso: string };

type SeccionResiduosProps = {
  perfil: string;
  area: string;
  residuos: Residuo[];
  setResiduos: (r: Residuo[]) => void;
  data: any;
  motivos: string[];
  inputClasses: string;
};

export default function SeccionResiduos({
  perfil, area, residuos, setResiduos, data, motivos, inputClasses
}: SeccionResiduosProps) {
  const handleChange = (i: number, f: keyof Residuo, v: string) => {
    const nuevos = [...residuos];
    nuevos[i] = { ...nuevos[i], [f]: v };
    setResiduos(nuevos);
  };

  const agregar = () =>
    setResiduos([...residuos, { residuo: "", categoria: "", motivo: "", peso: "" }]);

  const eliminar = (i: number) =>
    setResiduos(residuos.filter((_, idx) => idx !== i));

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
        Residuos
      </h3>

      {residuos.map((item, index) => (
        <div key={index} className="border p-4 rounded-lg mb-4 bg-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Residuo */}
            <div className="flex flex-col">
              <label>Residuo</label>
              <select
                value={item.residuo}
                onChange={(e) => handleChange(index, "residuo", e.target.value)}
                required
                disabled={!area}
                className={inputClasses}
              >
                <option value="">Seleccione residuo</option>
                {perfil && area &&
                  data[perfil].areas[area].residuos.map((r: string) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
              </select>
            </div>

            {/* Categoría */}
            <div className="flex flex-col">
              <label>Categoría</label>
              <select
                value={item.categoria}
                onChange={(e) => handleChange(index, "categoria", e.target.value)}
                required
                className={inputClasses}
              >
                <option value="">Seleccione categoría</option>
                <option value="peligroso">Peligroso</option>
                <option value="noPeligroso">No peligroso</option>
                <option value="reciclable">Reciclable</option>
              </select>
            </div>

            {/* Motivo */}
            <div className="flex flex-col md:col-span-2">
              <label>Motivo</label>
              <select
                value={item.motivo}
                onChange={(e) => handleChange(index, "motivo", e.target.value)}
                required
                className={inputClasses}
              >
                <option value="">Seleccione motivo</option>
                {motivos.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Peso */}
            <div className="flex flex-col md:col-span-2">
              <label>Peso (kg)</label>
              <input
                type="number"
                value={item.peso}
                onChange={(e) => handleChange(index, "peso", e.target.value)}
                required
                className={inputClasses}
              />
            </div>
          </div>

          {residuos.length > 1 && (
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => eliminar(index)}
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
        onClick={agregar}
        className="mt-2 bg-lightBlue text-white px-4 py-2 rounded shadow hover:bg-skyBlue transition"
      >
        ➕ Agregar residuo
      </button>
    </div>
  );
}
