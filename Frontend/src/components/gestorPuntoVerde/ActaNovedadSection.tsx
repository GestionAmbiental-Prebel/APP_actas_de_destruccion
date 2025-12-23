import { ConciliacionExtendida } from "../../services/actasConciliadas.service";

type ActaNovedadSectionProps = {
  acta: ConciliacionExtendida;
  onResolverNovedad: () => void;
};

export const ActaNovedadSection = ({ acta, onResolverNovedad }: ActaNovedadSectionProps) => {
  if (acta.tipo !== "con_novedad" || !acta.novedad) return null;

  return (
    <div className="mb-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <span>⚠️</span>
            <span>Novedad Pendiente</span>
          </h3>
          <p>{acta.novedad}</p>
        </div>
        <button
          onClick={onResolverNovedad}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition flex items-center gap-2"
        >
          <span>🔧</span>
          Resolver Novedad
        </button>
      </div>
    </div>
  );
};