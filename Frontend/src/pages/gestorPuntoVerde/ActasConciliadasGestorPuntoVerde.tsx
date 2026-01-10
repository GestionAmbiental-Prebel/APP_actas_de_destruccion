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
import { exportActasDetalladasToExcel } from "../../utils/exportExcel";
import { validarSoloNumeros, validarMaximoDigitos } from "../../utils/actaValidations";
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
      "sede_nombre",
      "clase_movimiento",
    ]);

  // Modal de eliminación
  const { actaAEliminar, modalEliminarAbierto, eliminando, abrirModal: abrirModalEliminar, cerrarModal: cerrarModalEliminar, eliminarActa } =
    useModalEliminar(cargarActas);

  // Modal de conciliación (ACTUALIZADO: ahora incluye novedadesPorResiduo)
  const {
    modalConciliarAbierto,
    actaConciliando,
    residuosEditables,
    residuosFiltrados,
    guardando,
    novedadesPorResiduo, // NUEVO: obtener las novedades por residuo
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
    
    // Verificar que los datos tengan las nuevas propiedades
    console.log("Datos del primer acta:", actasFiltradas[0]);
    console.log("¿Tiene sede_nombre?:", actasFiltradas[0]?.sede_nombre);
    console.log("¿Tiene clase_movimiento?:", actasFiltradas[0]?.clase_movimiento);
    
    // Preparar los datos según el formato que espera la función
    const datosParaExportar = actasFiltradas.map((acta) => ({
      ...acta,
      // Asegurar que los campos de fecha estén en formato string
      fecha_acta: acta.fecha_acta ? new Date(acta.fecha_acta).toISOString().split('T')[0] : "",
      fecha_conciliacion: acta.fecha_conciliacion ? new Date(acta.fecha_conciliacion).toISOString().split('T')[0] : "",
      // Añadir propiedades necesarias si no existen
      residuos: acta.residuos || [],
      tipo: acta.tipo || "conciliada",
      // Asegurar que las nuevas propiedades existan
      sede_nombre: acta.sede_nombre || "Sin sede",
      clase_movimiento: acta.clase_movimiento || "Sin clase",
    }));
    
    console.log("Datos preparados para exportar (primer registro):", datosParaExportar[0]);
    
    // Usar la función detallada que separa residuos
    exportActasDetalladasToExcel(datosParaExportar, `Actas_Punto_Verde_${new Date().toISOString().split("T")[0]}`);
  };

  const handleNuevaActa = () => {
    navigate("/gestor-punto-verde/nueva-acta");
  };

  const handleEditarActa = (acta: ConciliacionExtendida) => {
    navigate(`/gestor-punto-verde/editar-acta/${acta.acta_id}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue text-center mb-8">
        Actas Conciliadas – Punto Verde
      </h1>

      {/* Botones de acción */}
      <div className="flex justify-end mb-4">
        <div className="flex gap-2">
          <Button variant="success" onClick={exportarAExcel} className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            Exportar a Excel
          </Button>
          <Button variant="success" onClick={handleNuevaActa} className="flex items-center gap-2">
            <span className="text-xl">➕</span>
            Nueva Acta
          </Button>
        </div>
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
          // NUEVO: No es necesario pasar novedadesPorResiduo directamente
          // porque las novedades ya están incluidas en cada residuo dentro de residuosEditables
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