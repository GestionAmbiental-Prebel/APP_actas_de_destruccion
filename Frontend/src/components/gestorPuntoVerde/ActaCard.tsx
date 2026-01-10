import { ConciliacionExtendida } from "../../services/actasConciliadas.service";
import TableResiduosActa from "../common/TableResiduosActa";
import { ActaCardHeader } from "./ActaCardHeader";
import { ActaInfoSection } from "./ActaInfoSection";
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

  // DEPURACIÓN: Agrega esto para verificar los datos
  console.log("ActaCard recibida:", acta);
  console.log("Residuos en ActaCard:", acta.residuos);
  
  // Verificar cada residuo individualmente
  acta.residuos.forEach((r, i) => {
    console.log(`Residuo ${i}:`, {
      nombre: r.residuo_nombre,
      residuo_otro: r.residuo_otro,
      descripcion_residuo_otro: r.descripcion_residuo_otro,
      motivo: r.motivo,
      motivo_otro: r.motivo_otro,
      descripcion_motivo_otro: r.descripcion_motivo_otro
    });
  });

  // Preparar residuos para TableResiduosActa - FORMATO CORREGIDO
  const residuosParaTabla = acta.residuos.map((r) => {
    // CORRECCIÓN: Usar residuo_otro directamente si está disponible
    const residuoOtro = r.residuo_otro || r.descripcion_residuo_otro || "";
    const motivoOtro = r.motivo_otro || r.descripcion_motivo_otro || "";
    
    const residuoItem = {
      residuo_nombre: r.residuo_nombre || "",
      motivo: r.motivo || "",
      // Para compatibilidad con el TableResiduosActa actualizado
      descripcion_residuo_otro: residuoOtro,
      descripcion_motivo_otro: motivoOtro,
      peso_reportado: r.peso_reportado || "0",
      peso_conciliado: r.peso_conciliado || null,
      residuo_otro: residuoOtro,  // MANDATORIO: TableResiduosActa busca aquí primero
      motivo_otro: motivoOtro     // NUEVO: necesario para el motivo
    };
    
    console.log("Residuo mapeado para tabla:", residuoItem);
    return residuoItem;
  });

  console.log("Todos los residuos para tabla:", residuosParaTabla);

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

      <h3 className="text-lg font-bold mb-4 mt-6">
        ♻️ Residuos {acta.tipo === "conciliada" ? "conciliados" : ""}
      </h3>

      <TableResiduosActa residuos={residuosParaTabla} />

      {(acta.tipo === "conciliada" || acta.tipo === "pendiente") && (
        <ActaActionButtons onEditar={onEditar} onEliminar={onEliminar} />
      )}
    </div>
  );
};