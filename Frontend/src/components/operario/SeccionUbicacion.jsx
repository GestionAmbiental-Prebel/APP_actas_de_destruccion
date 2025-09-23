export default function SeccionUbicacion({
  area,
  setArea,
  centroCostos,
  setCentroCostos,
  sede,
  procedencia,
  setProcedencia,
}) {
  const inputClasses =
    "p-3 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-700 text-skyBlue dark:text-lightBlue";

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
        Ubicación organizacional
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Centro de Costos</label>
          <input
            type="text"
            value={centroCostos}
            onChange={(e) => setCentroCostos(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Área</label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Sub Área</label>
          <input
            type="text"
            value={procedencia}
            onChange={(e) => setProcedencia(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Sede</label>
          <input
            type="text"
            value={sede}
            readOnly
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
}
