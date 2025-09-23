const motivos = ["Vencimiento", "Deterioro", "Devolución", "Exceso", "Otro"];

export default function SeccionResiduos({ residuos, setResiduos }) {
  const inputClasses =
    "p-3 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-700 text-skyBlue dark:text-lightBlue";

  const handleChange = (i, field, value) => {
    const nuevos = [...residuos];
    nuevos[i][field] = value;
    setResiduos(nuevos);
  };

  const agregarResiduo = () =>
    setResiduos([...residuos, { residuo: "", categoria: "", motivo: "", peso: "" }]);

  const eliminarResiduo = (i) =>
    setResiduos(residuos.filter((_, idx) => idx !== i));

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
        Residuos
      </h3>
      {residuos.map((r, i) => (
        <div key={i} className="border p-4 rounded-lg mb-4 bg-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label>Residuo</label>
              <input
                type="text"
                value={r.residuo}
                onChange={(e) => handleChange(i, "residuo", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col">
              <label>Categoría</label>
              <select
                value={r.categoria}
                onChange={(e) => handleChange(i, "categoria", e.target.value)}
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
                value={r.motivo}
                onChange={(e) => handleChange(i, "motivo", e.target.value)}
                className={inputClasses}
              >
                <option value="">Seleccione motivo</option>
                {motivos.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label>Peso (kg)</label>
              <input
                type="number"
                value={r.peso}
                onChange={(e) => handleChange(i, "peso", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          {residuos.length > 1 && (
            <button
              type="button"
              onClick={() => eliminarResiduo(i)}
              className="text-red-500 text-sm mt-2"
            >
              Eliminar residuo
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={agregarResiduo}
        className="mt-2 bg-lightBlue text-white px-4 py-2 rounded shadow"
      >
        ➕ Agregar residuo
      </button>
    </div>
  );
}
