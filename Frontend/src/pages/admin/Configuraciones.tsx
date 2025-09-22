// src/pages/admin/Configuraciones.tsx
export const Configuraciones = () => {
  const opciones = [
    { label: "Gestionar sedes", desc: "Administra las sedes del sistema." },
    { label: "Gestionar áreas", desc: "Configura las áreas disponibles." },
    { label: "Gestionar centros de costo", desc: "Organiza los centros de costo." },
    { label: "Gestionar tipos de residuos", desc: "Controla los tipos de residuos registrados." },
  ];

  return (
    <div className="p-6 font-acidGrotesk">
      <h2 className="text-3xl font-bold mb-8 text-cyan-700 dark:text-cyan-400">
        Configuración del Sistema
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {opciones.map(({ label, desc }) => (
          <div
            key={label}
            className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
