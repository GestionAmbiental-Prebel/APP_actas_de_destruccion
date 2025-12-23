import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import FilteredDateActas from "../../components/common/FilteredDateActas";
import ModalEdicionActa from "./ModalConciliacionActa";
import { ActaTabsFilter } from "../../components/gestorPuntoVerde/ActaTabsFilter";
import { ActasListado } from "../../components/gestorPuntoVerde/ActasListado";
import { ModalEliminarActa } from "../../components/gestorPuntoVerde/ModalEliminarActa";
import { useFiltroActas } from "../../hooks/use.FilteredDateActas";
import { useActasConciliadas } from "../../hooks/use.ActasConciliadas";
import { useCatalogos } from "../../hooks/use.CatalogosActas";
import { useModalEliminar } from "../../hooks/use.ModalEliminar";
import { useModalConciliar } from "../../hooks/use.ModalConciliar";
import { exportToExcel } from "../../utils/exportExcel";
import { validarSoloNumeros, validarMaximoDigitos, calcularPesoTotal } from "../../utils/actaValidations";
import { ConciliacionExtendida } from "../../services/actasConciliadas.service";

export default function ActasConciliadasGestorPuntoVerde() {
  const navigate = useNavigate();
  const [filtroTab, setFiltroTab] = useState<"conciliadas" | "pendientes" | "novedad">("conciliadas");

  // Cargar datos principales
  const { actas, loading, error, cargarActas } = useActasConciliadas();
  const {
    residuosEspecificos,
    categoriasResiduos,
    subareas,
    centrosCosto,
    operarios,
    operariosPuntoVerde,
    motivosFiltrados,
  } = useCatalogos();

  // Filtros
  const { busqueda, setBusqueda, fechaInicio, setFechaInicio, fechaFin, setFechaFin, filtrar, limpiarFiltros } =
    useFiltroActas<ConciliacionExtendida>(actas, [
      "numero_acta",
      "residuos.residuo_nombre",
      "residuos.motivo",
      "conciliador_nombre",
    ]);

  // Modal de eliminación
  const { actaAEliminar, modalEliminarAbierto, eliminando, abrirModal: abrirModalEliminar, cerrarModal: cerrarModalEliminar, eliminarActa } =
    useModalEliminar(cargarActas);

  // Modal de conciliación (hook personalizado - ver siguiente sección)
  const {
    modalConciliarAbierto,
    actaConciliando,
    residuosEditables,
    residuosFiltrados,
    guardando,
    abrirModalResolverNovedad,
    cerrarModalConciliar,
    handleGuardarConciliacion,
    handlers,
  } = useModalConciliar({
    residuosEspecificos,
    categoriasResiduos,
    subareas,
    centrosCosto,
    operarios,
    operariosPuntoVerde,
    onSuccess: cargarActas,
  });

  // Filtrar actas por tab
  const actasFiltradas = filtrar().filter((a) => {
    if (filtroTab === "conciliadas") return a.tipo === "conciliada";
    if (filtroTab === "pendientes") return a.tipo === "pendiente";
    if (filtroTab === "novedad") return a.tipo === "con_novedad";
    return true;
  });

  // Exportar a Excel
  const exportarAExcel = () => {
    if (actasFiltradas.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const datosParaExcel = actasFiltradas.map((acta) => {
      const pesoReportado = acta.residuos.reduce((sum, r) => sum + Number(r.peso_reportado ?? 0), 0);
      const pesoConciliado = calcularPesoTotal(acta.residuos);

      return {
        "Número de Acta": acta.numero_acta,
        Fecha: new Date(acta.fecha_acta).toLocaleDateString("es-CO"),
        Estado:
          acta.tipo === "conciliada"
            ? "Conciliada"
            : acta.tipo === "pendiente"
            ? "Pendiente"
            : acta.tipo === "con_novedad"
            ? "Con Novedad"
            : "Sin estado",
        Subárea: acta.subarea_nombre ?? "Sin subárea",
        "Centro de Costo": acta.centro_costo_codigo
          ? `${acta.centro_costo_codigo}${acta.centro_costo_nombre ? ` – ${acta.centro_costo_nombre}` : ""}`
          : "Sin centro de costo",
        Consecutivo: acta.consecutivo || "",
        "Número de Inventario": acta.numero_inventario || "",
        "Operario (Cédula)": acta.operario_documento || "",
        "Operario (Nombre)": acta.operario_nombre || "",
        "Conciliador (Cédula)": acta.conciliador_documento || "",
        "Conciliador (Nombre)": acta.conciliador_nombre || "",
        "Peso Reportado (kg)": pesoReportado.toFixed(2),
        "Peso Conciliado (kg)": pesoConciliado.toFixed(2),
        "Fecha Conciliación": acta.fecha_conciliacion
          ? new Date(acta.fecha_conciliacion).toLocaleDateString("es-CO")
          : "",
        "Número de Residuos": acta.residuos.length,
        Novedad: acta.novedad || "",
      };
    });

    exportToExcel(datosParaExcel, `Actas_Conciliadas_${new Date().toISOString().split("T")[0]}`);
  };

  const handleEditarActa = (acta: ConciliacionExtendida) => {
  navigate(`/gestor-punto-verde/editar-acta/${acta.acta_id}`);
};

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue text-center mb-8">
        Actas Conciliadas – Punto Verde
      </h1>

      <div className="flex justify-end mb-4">
        <Button variant="success" onClick={exportarAExcel} className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          Exportar a Excel
        </Button>
      </div>

      <ActaTabsFilter filtroTab={filtroTab} setFiltroTab={setFiltroTab} />

      <FilteredDateActas
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        limpiarFiltros={limpiarFiltros}
        onRefrescar={cargarActas}
        loading={loading}
      />

      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}

      <ActasListado
        actas={actasFiltradas}
        loading={loading}
        onEditar={handleEditarActa}
        onEliminar={abrirModalEliminar}
        onResolverNovedad={abrirModalResolverNovedad}
      />

      {modalConciliarAbierto && actaConciliando && (
        <ModalEdicionActa
          actaEditando={actaConciliando}
          residuosEditables={residuosEditables}
          residuosFiltrados={residuosFiltrados}
          motivosFiltrados={motivosFiltrados}
          subareas={subareas}
          centrosCosto={centrosCosto}
          operarios={operarios}
          operariosPuntoVerde={operariosPuntoVerde}
          guardando={guardando}
          onClose={cerrarModalConciliar}
          onGuardar={handleGuardarConciliacion}
          {...handlers}
          validarSoloNumeros={validarSoloNumeros}
          validarMaximoDigitos={validarMaximoDigitos}
          modo="conciliacion"
          esNovedad={actaConciliando.tipo === "con_novedad"}
          permiteEditarTodo={true}
        />
      )}

      {modalEliminarAbierto && actaAEliminar && (
        <ModalEliminarActa
          acta={actaAEliminar}
          eliminando={eliminando}
          onConfirmar={eliminarActa}
          onCancelar={cerrarModalEliminar}
        />
      )}
    </div>
  );
}