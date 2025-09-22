// src/pages/gestorPuntoVerde/DashboardPuntoVerde.tsx
export const DashboardPuntoVerde = () => {
  return (
    <div className="p-6 space-y-6 font-acidGrotesk">
      <h2 className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
        Dashboard Punto Verde
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h3 className="text-gray-500">Actas Conciliadas</h3>
          <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
            45
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h3 className="text-gray-500">Actas Pendientes por Conciliar</h3>
          <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
            12
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
          <h3 className="text-gray-500">Peso Conciliado (Mes)</h3>
          <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
            320 kg
          </p>
        </div>
      </div>
    </div>
  );
};
