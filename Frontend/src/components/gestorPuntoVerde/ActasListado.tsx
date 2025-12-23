import { ConciliacionExtendida } from "../../services/actasConciliadas.service";
import { ActaCard } from "./ActaCard";

type ActasListadoProps = {
  actas: ConciliacionExtendida[];
  loading: boolean;
  onEditar: (acta: ConciliacionExtendida) => void;
  onEliminar: (acta: ConciliacionExtendida) => void;
  onResolverNovedad: (acta: ConciliacionExtendida) => void;
};

export const ActasListado = ({
  actas,
  loading,
  onEditar,
  onEliminar,
  onResolverNovedad,
}: ActasListadoProps) => {
  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Cargando...</p>;
  }

  if (actas.length === 0) {
    return <p className="text-center mt-10 text-gray-400">No hay actas.</p>;
  }

  return (
    <div className="space-y-8">
      {actas.map((acta) => (
        <ActaCard
          key={acta.id}
          acta={acta}
          onEditar={() => onEditar(acta)}
          onEliminar={() => onEliminar(acta)}
          onResolverNovedad={() => onResolverNovedad(acta)}
        />
      ))}
    </div>
  );
};
