import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import FilteredDateActas from "../../components/common/FilteredDateActas";
import { ActasListadoGestorAmbiental } from "../../components/gestorAmbiental/ActasListadoGestorAmbiental";
import { ModalEliminarActa } from "../../components/gestorPuntoVerde/ModalEliminarActa";
import { useFiltroActas } from "../../hooks/use.FilteredDateActas";
import { useActasConciliadas } from "../../hooks/use.ActasConciliadas";
import { useModalEliminar } from "../../hooks/use.ModalEliminar";
import { exportActasDetalladasToExcel } from "../../utils/exportExcel";
import { ConciliacionExtendida } from "../../services/actasConciliadas.service";

export default function ActasConciliadasGestorAmbiental() {
  const navigate = useNavigate();

  // Cargar datos principales
  const { actas, loading, error, cargarActas } = useActasConciliadas();

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

  // Filtrar solo actas conciliadas para gestorAmbiental
  const actasConciliadas = filtrar().filter((a) => a.tipo === "conciliada");

  // Función para exportar actas con residuos expandidos
  const exportarAExcel = () => {
    if (actasConciliadas.length === 0) {
      alert("No hay actas conciliadas para exportar");
      return;
    }
    
    // Verificar que los datos tengan las nuevas propiedades
    console.log("Datos del primer acta:", actasConciliadas[0]);
    console.log("¿Tiene sede_nombre?:", actasConciliadas[0]?.sede_nombre);
    console.log("¿Tiene clase_movimiento?:", actasConciliadas[0]?.clase_movimiento);
    
    // Preparar los datos según el formato que espera la función
    const datosParaExportar = actasConciliadas.map((acta) => ({
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
    exportActasDetalladasToExcel(datosParaExportar, "actas_conciliadas_gestor_ambiental");
  };

  // Función para editar acta - navega a una ruta de edición
  const handleEditarActa = (acta: ConciliacionExtendida) => {
    navigate(`/gestor-ambiental/editar-acta/${acta.acta_id}`);
  };

  // Función para crear nueva acta
  const handleNuevaActa = () => {
    navigate("/gestor-ambiental/nueva-acta");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue text-center mb-8">
        Actas Conciliadas – Gestor Ambiental
      </h1>

      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {loading ? "Cargando..." : `Mostrando ${actasConciliadas.length} actas conciliadas`}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="success" 
            onClick={exportarAExcel} 
            className="flex items-center gap-2"
            disabled={actasConciliadas.length === 0}
          >
            <span className="text-xl">📊</span>
            Exportar a Excel
          </Button>
          
          <Button variant="success" onClick={handleNuevaActa} className="flex items-center gap-2">
            <span className="text-xl">➕</span>
            Nueva Acta
          </Button>
        </div>
      </div>

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

      <ActasListadoGestorAmbiental
        actas={actasConciliadas}
        loading={loading}
        onEditar={handleEditarActa}
        onEliminar={abrirModalEliminar}
        onResolverNovedad={() => {}}
      />

      {modalEliminarAbierto && actaAEliminar && (
        <ModalEliminarActa         acta={actaAEliminar}
          eliminando={eliminando}
          onConfirmar={eliminarActa}
          onCancelar={cerrarModalEliminar}
        />
      )}
    </div>
  );
}