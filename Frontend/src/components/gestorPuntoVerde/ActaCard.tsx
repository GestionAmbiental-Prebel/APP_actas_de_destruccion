import { ConciliacionExtendida } from "../../services/actasConciliadas.service";
import TableResiduosActa from "../common/TableResiduosActa";
import { ActaCardHeader } from "./ActaCardHeader";
import { ActaInfoSection } from "./ActaInfosection";
import { ActaOperarioSection } from "./ActaOperarioSection";
import { ActaConciliadorSection } from "./ActaConciliadorSection";
import { ActaNovedadSection } from "./ActaNovedadSection";
import { ActaActionButtons } from "./ActaActionButtons";
import { calcularPesoTotal } from "../../utils/actaValidations";
import { getEstilosPorEstado, getHoverPorEstado } from "../../utils/estilosActa";

type ActaCardProps = {
  acta: ConciliacionExtendida;
  onEditar: () => void;
  onEliminar: () => void;
  onResolverNovedad: () => void;
};

export const ActaCard = ({ acta, onEditar, onEliminar, onResolverNovedad }: ActaCardProps) => {
  const pesoConciliado = calcularPesoTotal(acta.residuos);
  const pesoReportado = acta.residuos.reduce(
    (sum, r) => sum + Number(r.peso_reportado ?? 0),
    0
  );

  const estilos = getEstilosPorEstado(acta.tipo);
  const hoverEstilos = getHoverPorEstado(acta.tipo);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition border-l-4 ${estilos.borderColor} ${hoverEstilos}`}
    >
      <ActaCardHeader acta={acta} pesoReportado={pesoReportado} pesoConciliado={pesoConciliado} />
      <ActaInfoSection acta={acta} />
      <ActaOperarioSection
        documento={acta.operario_documento}
        nombre={acta.operario_nombre}
        titulo="👤 Operario (Entrega)"
      />
      <ActaConciliadorSection acta={acta} />
      <ActaNovedadSection acta={acta} onResolverNovedad={onResolverNovedad} />

      <h3 className="text-lg font-bold mb-4">
        ♻️ Residuos {acta.tipo === "conciliada" ? "conciliados" : ""}
      </h3>

      <TableResiduosActa
        residuos={acta.residuos.map((r) => ({
          ...r,
          residuo_nombre:
            r.residuo_nombre === "Otro"
              ? `Otro – ${r.descripcion_residuo_otro ?? ""}`
              : r.residuo_nombre,
          motivo:
            r.motivo === "Otro" ? `Otro – ${r.descripcion_motivo_otro ?? ""}` : r.motivo,
        }))}
      />

      {(acta.tipo === "conciliada" || acta.tipo === "pendiente") && (
        <ActaActionButtons onEditar={onEditar} onEliminar={onEliminar} />
      )}
    </div>
  );
};
