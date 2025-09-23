export default function SeccionIdentificacion({
  cedula,
  setCedula,
  nombre,
  setNombre,
  apellido,
  setApellido,
}) {
  const inputClasses =
    "p-3 border border-skyBlue dark:border-lightBlue rounded bg-white dark:bg-gray-700 text-skyBlue dark:text-lightBlue";

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-skyBlue dark:text-lightBlue">
        Identificación
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Cédula</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Apellido</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
}
