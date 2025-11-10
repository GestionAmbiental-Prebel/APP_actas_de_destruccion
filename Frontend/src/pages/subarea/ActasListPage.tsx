import { useEffect, useState } from "react";
import ActasList from "../../components/actas/ActasList";

export const ActasListPage = () => {
  const [actas, setActas] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("actas");
    if (stored) {
      setActas(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-sky-700 dark:text-sky-400 mb-6 text-center">
          Actas Registradas
        </h1>

        <ActasList actas={actas} />
      </div>
    </div>
  );
};
