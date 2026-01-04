import { ConciliacionExtendida } from "../../services/actasConciliadas.service";
import { ActaCard } from "../gestorPuntoVerde/ActaCard"; 

type ActasListadoGestorAmbientalProps = {
  actas: ConciliacionExtendida[];
  loading: boolean;
  onEditar: (acta: ConciliacionExtendida) => void;
  onEliminar: (acta: ConciliacionExtendida) => void;
  onResolverNovedad: (acta: ConciliacionExtendida) => void;
};

export const ActasListadoGestorAmbiental = ({
  actas,
  loading,
  onEditar,
  onEliminar,
  onResolverNovedad,
}: ActasListadoGestorAmbientalProps) => {
  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Cargando...</p>;
  }

  // Filtrar solo actas conciliadas
  const actasConciliadas = actas.filter((acta) => acta.tipo === "conciliada");

  if (actasConciliadas.length === 0) {
    return <p className="text-center mt-10 text-gray-400">No hay actas conciliadas.</p>;
  }

  return (
    <div className="space-y-8">
      {actasConciliadas.map((acta) => (
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