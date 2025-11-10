type SeccionIdentificacionProps = {
  cedula: string;
  setCedula: (v: string) => void;
  nombre: string;
  setNombre: (v: string) => void;
  apellido: string;
  setApellido: (v: string) => void;
  onCedulaBlur: () => void;
  inputClasses: string;
};

export default function SeccionIdentificacion({
  cedula, setCedula,
  nombre, setNombre,
  apellido, setApellido,
  onCedulaBlur,
  inputClasses
}: SeccionIdentificacionProps) {
  return (
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
            onBlur={onCedulaBlur}
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
            onChange={(e) =>
              setNombre(
                e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "").slice(0, 50)
              )
            }
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
            onChange={(e) =>
              setApellido(
                e.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "").slice(0, 50)
              )
            }
            required
            className={inputClasses}
          />
        </div>
      </div>
    </div>
  );
}
