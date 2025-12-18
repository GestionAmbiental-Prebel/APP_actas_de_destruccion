import TableResiduosActa from "../../components/common/TableResiduosActa";
import ModalEdicionActa from "../gestorPuntoVerde/ModalEdicionActa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  obtenerActasConciliadas,
  ConciliacionExtendida,
} from "../../services/actasConciliadas.service";

import Button from "../../components/common/Button";
import { useFiltroActas } from "../../hooks/use.FilteredDateActas";
import FilteredDateActas from "../../components/common/FilteredDateActas";
import { sortByDateDesc } from "../../utils/sortByDate";
import { apiRequest } from "../../services/api.service";
import { 
  obtenerResiduosEspecificos, 
  obtenerCategoriasResiduos,
  obtenerSubAreas,
  obtenerCentrosCosto 
} from "../../services/catalogo.service";
import { exportToExcel } from "../../utils/exportExcel";
import { obtenerOperarios, obtenerOperariosPuntoVerde } from "../../services/operarios.service";

type ResiduoEditable = {
  acta_generacion_residuo_id: number;
  residuo_nombre: string;
  residuo_id: number;
  motivo: string;
  descripcion_residuo_otro?: string;
  descripcion_motivo_otro?: string;
  peso_reportado: string;
  peso_conciliado: string;
  motivo_otro?: string | null;
  residuo_otro?: string | null;
  categoria_id?: number | null;
  generacion_residuo_id?: number;
};

type ActaEditable = {
  subarea_id?: number;
  centro_costo_id?: number;
  consecutivo?: string | number | null;
  numero_inventario?: string | number | null;
  fecha_acta: string;
  operario_documento?: string;
  conciliador_documento?: string;
  residuos: ResiduoEditable[];
};

export default function ActasConciliadasGestorPuntoVerde() {
  const [actas, setActas] = useState<ConciliacionExtendida[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filtroTab, setFiltroTab] = useState<
    "conciliadas" | "pendientes" | "novedad"
  >("conciliadas");
  
  // Estado para confirmación de eliminación
  const [actaAEliminar, setActaAEliminar] = useState<ConciliacionExtendida | null>(null);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Modal SOLO para resolver novedades (conciliar)
  const [modalConciliarAbierto, setModalConciliarAbierto] = useState(false);
  const [actaConciliando, setActaConciliando] = useState<ConciliacionExtendida | null>(null);
  const [residuosEditables, setResiduosEditables] = useState<ResiduoEditable[]>([]);
  const [guardando, setGuardando] = useState(false);
  
  // Estados para selects filtrados
  const [residuosFiltrados, setResiduosFiltrados] = useState<any[]>([]);
  const [categoriasResiduos, setCategoriasResiduos] = useState<any[]>([]);
  const [residuosEspecificos, setResiduosEspecificos] = useState<any[]>([]);
  const [subareas, setSubareas] = useState<any[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [operarios, setOperarios] = useState<any[]>([]);
  const [operariosPuntoVerde, setOperariosPuntoVerde] = useState<any[]>([]);
  
  const [motivosFiltrados] = useState([
    { id: 1, nombre: 'Bloqueado' },
    { id: 2, nombre: 'Obsoleto' },
    { id: 3, nombre: 'Rechazado' },
    { id: 4, nombre: 'Vencido' },
    { id: 5, nombre: 'Otro' },
  ]);
  const [cargandoResiduos, setCargandoResiduos] = useState(false);

  const navigate = useNavigate();

  // ---- FILTROS ----
  const {
    busqueda,
    setBusqueda,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    filtrar,
    limpiarFiltros,
  } = useFiltroActas<ConciliacionExtendida>(actas, [
    "numero_acta",
    "residuos.residuo_nombre",
    "residuos.motivo",
    "conciliador_nombre",
  ]);

  // ---- FUNCIONES DE VALIDACIÓN MODIFICADAS ----
  const validarSoloNumeros = (valor: string | number | null | undefined): boolean => {
    if (valor === null || valor === undefined || valor === "") return true;
    const strValor = valor.toString();
    return /^\d*$/.test(strValor);
  };

  const validarMaximoDigitos = (valor: string | number | null | undefined, maxDigitos: number): boolean => {
    if (valor === null || valor === undefined || valor === "") return true;
    const strValor = valor.toString();
    return strValor.length <= maxDigitos;
  };

  // ---- CARGAR DATOS ----
  useEffect(() => {
    cargarActas();
    cargarCatalogos();
  }, []);

  const cargarActas = async () => {
    try {
      setLoading(true);
      const data = await obtenerActasConciliadas();
      setActas(sortByDateDesc(data, "fecha_acta"));
    } catch (err) {
      console.error(err);
      setError("Error cargando actas.");
    } finally {
      setLoading(false);
    }
  };

  const cargarCatalogos = async () => {
    try {
      const [
        residuosData, 
        categoriasData, 
        subareasData, 
        centrosCostoData, 
        operariosData,
      ] = await Promise.all([
        obtenerResiduosEspecificos(),
        obtenerCategoriasResiduos(),
        obtenerSubAreas(),
        obtenerCentrosCosto(),
        obtenerOperarios(),
      ]);
      
      setResiduosEspecificos(residuosData);
      setCategoriasResiduos(categoriasData);
      setSubareas(subareasData);
      setCentrosCosto(centrosCostoData);
      setOperarios(operariosData);
      
      // IMPORTANTE: Necesitamos las subáreas primero para filtrar operarios de punto verde
      const operariosPVData = await obtenerOperariosPuntoVerde(subareasData);
      setOperariosPuntoVerde(operariosPVData);
      
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
  };

  // ---- FUNCIÓN PARA ENCONTRAR OPERARIO POR DOCUMENTO ----
  const encontrarOperarioPorDocumento = (documento: string): number | null => {
    if (!documento) return null;
    const operario = operarios.find(op => op.documento === documento);
    return operario ? operario.id : null;
  };

  // ---- FUNCIÓN PARA ENCONTRAR CONCILIADOR POR DOCUMENTO ----
  const encontrarConciliadorPorDocumento = (documento: string): number | null => {
    if (!documento) return null;
    const conciliador = operariosPuntoVerde.find(op => op.documento === documento);
    return conciliador ? conciliador.id : null;
  };

  // ---- FILTRAR POR TABS ----
  const actasFiltradas = filtrar().filter((a) => {
    if (filtroTab === "conciliadas") return a.tipo === "conciliada";
    if (filtroTab === "pendientes") return a.tipo === "pendiente";
    if (filtroTab === "novedad") return a.tipo === "con_novedad";
    return true;
  });

  const calcularPesoTotal = (residuos: ConciliacionExtendida["residuos"]) =>
    residuos.reduce((sum, r) => sum + Number(r.peso_conciliado ?? 0), 0);

  // ---- FUNCIONES PARA FILTRAR RESIDUOS ----
  const obtenerResiduosFiltrados = (subAreaId?: number | null) => {
    if (!subAreaId) return [];
    
    const categoriasDeSubArea = categoriasResiduos.filter(
      cat => cat.subarea_id === subAreaId
    );
    
    const categoriaIds = categoriasDeSubArea.map(cat => cat.id);
    
    return residuosEspecificos.filter(
      res => categoriaIds.includes(res.categoria_id)
    );
  };

  // ---- FUNCIONES DE ELIMINACIÓN ----
  const abrirModalEliminar = (acta: ConciliacionExtendida) => {
    setActaAEliminar(acta);
    setModalEliminarAbierto(true);
  };

  const cerrarModalEliminar = () => {
    setModalEliminarAbierto(false);
    setActaAEliminar(null);
  };

  const handleEliminarActa = async () => {
    if (!actaAEliminar) return;
    
    try {
      setEliminando(true);
      
      await apiRequest(`/actas/${actaAEliminar.acta_id}/`, {
        method: "DELETE",
      });
      
      alert("✅ Acta eliminada exitosamente");
      
      await cargarActas();
      cerrarModalEliminar();
      
    } catch (err: any) {
      console.error("❌ Error eliminando acta:", err);
      alert(`Error al eliminar acta: ${err.message || "Error desconocido"}`);
    } finally {
      setEliminando(false);
    }
  };

  // ---- FUNCIÓN PARA EXPORTAR A EXCEL ----
  const exportarAExcel = () => {
    if (actasFiltradas.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // Preparar los datos para Excel
    const datosParaExcel = actasFiltradas.map(acta => {
      const pesoReportado = acta.residuos.reduce(
        (sum, r) => sum + Number(r.peso_reportado ?? 0),
        0
      );
      const pesoConciliado = calcularPesoTotal(acta.residuos);
      
      return {
        'Número de Acta': acta.numero_acta,
        'Fecha': new Date(acta.fecha_acta).toLocaleDateString("es-CO"),
        'Estado': acta.tipo === "conciliada" ? "Conciliada" : 
                 acta.tipo === "pendiente" ? "Pendiente" : 
                 acta.tipo === "con_novedad" ? "Con Novedad" : "Sin estado",
        'Subárea': acta.subarea_nombre ?? "Sin subárea",
        'Centro de Costo': acta.centro_costo_codigo 
          ? `${acta.centro_costo_codigo}${acta.centro_costo_nombre ? ` – ${acta.centro_costo_nombre}` : ""}`
          : "Sin centro de costo",
        'Consecutivo': acta.consecutivo || "",
        'Número de Inventario': acta.numero_inventario || "",
        'Operario (Cédula)': acta.operario_documento || "",
        'Operario (Nombre)': acta.operario_nombre || "",
        'Conciliador (Cédula)': acta.conciliador_documento || "",
        'Conciliador (Nombre)': acta.conciliador_nombre || "",
        'Peso Reportado (kg)': pesoReportado.toFixed(2),
        'Peso Conciliado (kg)': pesoConciliado.toFixed(2),
        'Fecha Conciliación': acta.fecha_conciliacion 
          ? new Date(acta.fecha_conciliacion).toLocaleDateString("es-CO")
          : "",
        'Número de Residuos': acta.residuos.length,
        'Novedad': acta.novedad || ""
      };
    });

    exportToExcel(datosParaExcel, `Actas_Conciliadas_${new Date().toISOString().split('T')[0]}`);
  };

  // ---- FUNCIÓN PARA EDITAR ACTA (NAVEGA A PÁGINA DE EDICIÓN) ----
  const handleEditarActa = (acta: ConciliacionExtendida) => {
    navigate(`/gestor-punto-verde/actas/editar/${acta.acta_id}`);
  };


  // ---- FUNCIÓN PARA OBTENER ESTILOS SEGÚN ESTADO ----
const getEstilosPorEstado = (tipo: string) => {
  switch (tipo) {
    case "conciliada":
      return {
        bgColor: "bg-green-50 dark:bg-green-900/20",
        textColor: "text-green-800 dark:text-green-200",
        borderColor: "border-green-200 dark:border-green-700",
        badgeColor: "bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200",
        icon: "✅"
      };
      case "pendiente":
      return {
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        textColor: "text-gray-800 dark:text-gray-200",
        borderColor: "border-gray-200 dark:border-gray-700",
        badgeColor: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
        icon: "⏳",
        pesoColor: "text-gray-600 dark:text-gray-400"
      };
    case "con_novedad":
      return {
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        textColor: "text-yellow-800 dark:text-yellow-200",
        borderColor: "border-yellow-200 dark:border-yellow-700",
        badgeColor: "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200",
        icon: "⚠️",
        pesoColor: "text-yellow-600 dark:text-yellow-400"
      };
    default:
      return {
        bgColor: "bg-gray-50 dark:bg-gray-800/20",
        textColor: "text-gray-800 dark:text-gray-200",
        borderColor: "border-gray-200 dark:border-gray-700",
        badgeColor: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
        icon: "📄"
      };
  }
};

// ---- FUNCIÓN PARA OBTENER HOVER SEGÚN ESTADO ----
const getHoverPorEstado = (tipo: string) => {
  switch (tipo) {
    case "conciliada":
      return "hover:shadow-green-100 dark:hover:shadow-green-900/30 hover:border-green-300";
    case "pendiente":
      return "hover:shadow-gray-100 dark:hover:shadow-gray-900/30 hover:border-gray-300";
    case "con_novedad":
      return "hover:shadow-yellow-100 dark:hover:shadow-yellow-900/30 hover:border-yellow-300";
    default:
      return "hover:shadow-lg hover:border-gray-300";
  }
};

// ---- FUNCIÓN PARA OBTENER TEXTO DEL ESTADO ----
const getTextoEstado = (tipo: string) => {
  switch (tipo) {
    case "conciliada": return "Conciliada";
    case "pendiente": return "Pendiente";
    case "con_novedad": return "Con Novedad";
    default: return "Sin estado";
  }
};
  // ---- MODAL PARA RESOLVER NOVEDADES ----
  const abrirModalResolverNovedad = async (acta: ConciliacionExtendida) => {
    setActaConciliando(acta);
    
    try {
      const relacionesCompletas = await apiRequest<any[]>('/actas-generacion-residuo/');
      
      const residuosEdit: ResiduoEditable[] = acta.residuos.map((r) => {
        const residuoEspecifico = residuosEspecificos.find(
          res => res.nombre === r.residuo_nombre || 
                 (r.residuo_nombre.includes("Otro") && res.nombre === "Otro")
        );
        
        const relacionCompleta = relacionesCompletas.find(
          (rel: any) => rel.id === r.acta_generacion_residuo_id
        );
        
        return {
          acta_generacion_residuo_id: r.acta_generacion_residuo_id || 0,
          generacion_residuo_id: relacionCompleta?.generacion_residuo_id,
          residuo_id: residuoEspecifico?.id || 0,
          residuo_nombre: r.residuo_nombre,
          categoria_id: residuoEspecifico?.categoria_id || null,
          motivo: r.motivo,
          descripcion_residuo_otro: r.descripcion_residuo_otro || "",
          descripcion_motivo_otro: r.descripcion_motivo_otro || "",
          peso_reportado: r.peso_reportado,
          peso_conciliado: r.peso_conciliado || r.peso_reportado,
          motivo_otro: r.motivo === "Otro" ? r.descripcion_motivo_otro : null,
          residuo_otro: r.residuo_nombre.includes("Otro") ? r.descripcion_residuo_otro : null,
        };
      });
      
      setResiduosEditables(residuosEdit);
      
      if (acta.subarea_id) {
        const residuosFiltrados = obtenerResiduosFiltrados(acta.subarea_id);
        setResiduosFiltrados(residuosFiltrados);
      }
      
      setModalConciliarAbierto(true);
    } catch (error) {
      console.error("Error cargando relaciones:", error);
      alert("Error al cargar datos para conciliar");
    }
  };

  const cerrarModalConciliar = () => {
    setModalConciliarAbierto(false);
    setActaConciliando(null);
    setResiduosEditables([]);
    setResiduosFiltrados([]);
  };

  // ---- FUNCIONES DE MANEJO DE CAMBIOS PARA CONCILIAR ----
  const handleCambioPesoConciliado = (index: number, valor: string) => {
    const nuevosResiduos = [...residuosEditables];
    nuevosResiduos[index].peso_conciliado = valor;
    setResiduosEditables(nuevosResiduos);
  };

  const handleCambioResiduo = (index: number, residuoId: number) => {
    const nuevosResiduos = [...residuosEditables];
    const residuoSeleccionado = residuosFiltrados.find(r => r.id === residuoId);
    
    nuevosResiduos[index].residuo_id = residuoId;
    nuevosResiduos[index].residuo_nombre = residuoSeleccionado?.nombre || "";
    nuevosResiduos[index].categoria_id = residuoSeleccionado?.categoria_id || null;
    
    if (residuoSeleccionado?.nombre === "Otro") {
      nuevosResiduos[index].residuo_otro = nuevosResiduos[index].descripcion_residuo_otro || "";
    } else {
      nuevosResiduos[index].residuo_otro = null;
      nuevosResiduos[index].descripcion_residuo_otro = "";
    }
    
    setResiduosEditables(nuevosResiduos);
  };

  const handleCambioMotivo = (index: number, motivo: string) => {
    const nuevosResiduos = [...residuosEditables];
    nuevosResiduos[index].motivo = motivo;
    
    if (motivo === "Otro") {
      nuevosResiduos[index].motivo_otro = nuevosResiduos[index].descripcion_motivo_otro || "";
    } else {
      nuevosResiduos[index].motivo_otro = null;
      nuevosResiduos[index].descripcion_motivo_otro = "";
    }
    
    setResiduosEditables(nuevosResiduos);
  };

  const handleCambioConsecutivo = (valor: string | null) => {
    if (!actaConciliando) return;
    setActaConciliando({
      ...actaConciliando,
      consecutivo: valor
    } as ConciliacionExtendida);
  };

  const handleCambioNumeroInventario = (valor: string | null) => {
    if (!actaConciliando) return;
    setActaConciliando({
      ...actaConciliando,
      numero_inventario: valor
    } as ConciliacionExtendida);
  };

  const handleCambioOperarioDocumento = (valor: string) => {
    if (!actaConciliando) return;
    setActaConciliando({
      ...actaConciliando,
      operario_documento: valor
    });
  };

  const handleCambioConciliadorDocumento = (valor: string) => {
    if (!actaConciliando) return;
    setActaConciliando({
      ...actaConciliando,
      conciliador_documento: valor
    });
  };

  // ---- NUEVA FUNCIÓN PARA MANEJAR CAMBIOS EN CONCILIADOR (con select) ----
  const handleCambioConciliador = (conciliadorId: number | null, conciliadorDocumento?: string) => {
    if (!actaConciliando) return;
    
    const actaActualizada = {
      ...actaConciliando,
      conciliador_documento: conciliadorDocumento || actaConciliando.conciliador_documento
    };
    setActaConciliando(actaActualizada as ConciliacionExtendida);
  };

  // ---- FUNCIONES PARA MANEJAR CAMBIOS EN CAMPOS AVANZADOS ----
  const handleCambioSubarea = (subareaId: number | null) => {
    if (!actaConciliando) return;
    
    // Actualizar acta
    const actaActualizada = {
      ...actaConciliando,
      subarea_id: subareaId
    };
    setActaConciliando(actaActualizada as ConciliacionExtendida);
    
    // Actualizar residuos filtrados si hay subárea
    if (subareaId) {
      const nuevosResiduosFiltrados = obtenerResiduosFiltrados(subareaId);
      setResiduosFiltrados(nuevosResiduosFiltrados);
    } else {
      setResiduosFiltrados([]);
    }
  };

  const handleCambioCentroCosto = (centroCostoId: number | null) => {
    if (!actaConciliando) return;
    
    const actaActualizada = {
      ...actaConciliando,
      centro_costo_id: centroCostoId
    };
    setActaConciliando(actaActualizada as ConciliacionExtendida);
    
    // Si se selecciona un centro de costo, autocompletar su subárea
    if (centroCostoId) {
      const centro = centrosCosto.find(cc => cc.id === centroCostoId);
      if (centro && centro.subarea_id) {
        handleCambioSubarea(centro.subarea_id);
        
        const actaConSubarea = {
          ...actaActualizada,
          subarea_id: centro.subarea_id,
          subarea_nombre: subareas.find(s => s.id === centro.subarea_id)?.nombre || ""
        };
        setActaConciliando(actaConSubarea as ConciliacionExtendida);
      }
    }
  };

  const handleCambioOperario = (operarioId: number | null, operarioDocumento?: string) => {
    if (!actaConciliando) return;
    
    const actaActualizada = {
      ...actaConciliando,
      operario_documento: operarioDocumento || actaConciliando.operario_documento
    };
    setActaConciliando(actaActualizada as ConciliacionExtendida);
  };

  // ---- FUNCIONES PARA MANEJAR RESIDUOS EN EDICIÓN ----
  const handleAgregarResiduo = () => {
    if (!actaConciliando) return;
    
    const nuevoResiduo: ResiduoEditable = {
      acta_generacion_residuo_id: 0,
      generacion_residuo_id: 0,
      residuo_id: residuosFiltrados.length > 0 ? residuosFiltrados[0].id : 0,
      residuo_nombre: residuosFiltrados.length > 0 ? residuosFiltrados[0].nombre : "Sin residuo",
      categoria_id: residuosFiltrados.length > 0 ? residuosFiltrados[0].categoria_id : null,
      motivo: "Bloqueado",
      descripcion_residuo_otro: "",
      descripcion_motivo_otro: "",
      peso_reportado: "0",
      peso_conciliado: "0",
      motivo_otro: null,
      residuo_otro: null
    };
    
    setResiduosEditables([...residuosEditables, nuevoResiduo]);
  };

  const handleEliminarResiduo = (index: number) => {
    const nuevosResiduos = [...residuosEditables];
    nuevosResiduos.splice(index, 1);
    setResiduosEditables(nuevosResiduos);
  };

  const handleCambioPesoReportado = (index: number, valor: string) => {
    const nuevosResiduos = [...residuosEditables];
    nuevosResiduos[index].peso_reportado = valor;
    
    if (!nuevosResiduos[index].peso_conciliado || nuevosResiduos[index].peso_conciliado === "0") {
      nuevosResiduos[index].peso_conciliado = valor;
      handleCambioPesoConciliado(index, valor);
    }
    
    setResiduosEditables(nuevosResiduos);
  };

  const handleCambioDescripcionResiduoOtro = (index: number, valor: string) => {
    const nuevosResiduos = [...residuosEditables];
    nuevosResiduos[index].descripcion_residuo_otro = valor;
    nuevosResiduos[index].residuo_otro = valor;
    setResiduosEditables(nuevosResiduos);
  };

  const handleCambioDescripcionMotivoOtro = (index: number, valor: string) => {
    const nuevosResiduos = [...residuosEditables];
    nuevosResiduos[index].descripcion_motivo_otro = valor;
    nuevosResiduos[index].motivo_otro = valor;
    setResiduosEditables(nuevosResiduos);
  };

  // ---- GUARDAR CONCILIACIÓN PARA ACTAS CON NOVEDAD ----
  const handleGuardarConciliacion = async () => {
    if (!actaConciliando) return;

    try {
      setGuardando(true);

      // Validar pesos conciliados
      for (const residuo of residuosEditables) {
        if (!residuo.peso_conciliado || parseFloat(residuo.peso_conciliado) <= 0) {
          alert("Todos los residuos deben tener un peso conciliado mayor a 0");
          return;
        }
      }

      // Validar documentos
      const operarioDoc = actaConciliando.operario_documento?.toString() || "";
      if (!operarioDoc || !validarSoloNumeros(operarioDoc)) {
        alert("El documento del operario es requerido y solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(operarioDoc, 10)) {
        alert("El documento del operario no puede tener más de 10 dígitos");
        return;
      }

      const conciliadorDoc = actaConciliando.conciliador_documento?.toString() || "";
      if (!conciliadorDoc || !validarSoloNumeros(conciliadorDoc)) {
        alert("El documento del conciliador es requerido y solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(conciliadorDoc, 10)) {
        alert("El documento del conciliador no puede tener más de 10 dígitos");
        return;
      }

      // Validar que el conciliador sea de punto verde
      const conciliador = operariosPuntoVerde.find(op => 
        op.documento === conciliadorDoc
      );
      
      if (!conciliador) {
        alert("❌ El documento del conciliador no corresponde a un operario de Punto Verde autorizado para conciliar");
        return;
      }

      // Validar consecutivo e inventario
      if (!validarSoloNumeros(actaConciliando.consecutivo)) {
        alert("El consecutivo solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(actaConciliando.consecutivo, 6)) {
        alert("El consecutivo no puede tener más de 6 dígitos");
        return;
      }

      if (!validarSoloNumeros(actaConciliando.numero_inventario)) {
        alert("El número de inventario solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(actaConciliando.numero_inventario, 11)) {
        alert("El número de inventario no puede tener más de 11 dígitos");
        return;
      }

      // 1. PREPARAR ACTA PARA ACTUALIZAR
      const actaActualizada: any = {
        documento_entrega: actaConciliando.operario_documento,
        documento_recepcion: conciliadorDoc,
        fecha_conciliacion: new Date().toISOString(),
      };

      // Si se modificó la subárea o centro de costo, incluirlos
      if (actaConciliando.subarea_id) {
        actaActualizada.subarea_id = actaConciliando.subarea_id;
      }
      
      if (actaConciliando.centro_costo_id) {
        actaActualizada.centro_costo_id = actaConciliando.centro_costo_id;
      }

      // Manejar consecutivo
      if (actaConciliando.consecutivo !== undefined && actaConciliando.consecutivo !== null) {
        const consecutivoStr = actaConciliando.consecutivo.toString().trim();
        if (consecutivoStr !== "") {
          const consecutivoNum = parseInt(consecutivoStr, 10);
          actaActualizada.consecutivo = !isNaN(consecutivoNum) ? consecutivoNum : consecutivoStr;
        } else {
          actaActualizada.consecutivo = null;
        }
      } else {
        actaActualizada.consecutivo = null;
      }

      // Manejar número de inventario
      if (actaConciliando.numero_inventario !== undefined && actaConciliando.numero_inventario !== null) {
        const inventarioStr = actaConciliando.numero_inventario.toString().trim();
        if (inventarioStr !== "") {
          const inventarioNum = parseInt(inventarioStr, 10);
          actaActualizada.numero_inventario = !isNaN(inventarioNum) ? inventarioNum : inventarioStr;
        } else {
          actaActualizada.numero_inventario = null;
        }
      } else {
        actaActualizada.numero_inventario = null;
      }

      console.log("📤 Actualizando acta:", actaActualizada);

      // 2. ACTUALIZAR EL ACTA
      await apiRequest(`/actas/${actaConciliando.acta_id}/`, {
        method: "PATCH",
        body: actaActualizada,
      });

      // 3. PROCESAR CADA RESIDUO
      for (const residuo of residuosEditables) {
        if (residuo.acta_generacion_residuo_id === 0) {
          // RESIDUO NUEVO: Crear primero la generación y luego la relación
          
          const operarioId = encontrarOperarioPorDocumento(actaConciliando.operario_documento || "");
          
          if (!operarioId) {
            alert("No se pudo encontrar el operario. Verifica el documento del operario.");
            setGuardando(false);
            return;
          }
          
          const nuevaGeneracion = await apiRequest<any>("/generacion-residuo/", {
            method: "POST",
            body: {
              fecha: actaConciliando.fecha_acta,
              peso: residuo.peso_reportado,
              residuo_id: residuo.residuo_id,
              operario_id: operarioId,
              motivo: residuo.motivo,
              motivo_otro: residuo.motivo_otro,
              residuo_otro: residuo.residuo_otro,
            },
          });

          // Crear la relación acta-generación
          await apiRequest("/actas-generacion-residuo/", {
            method: "POST",
            body: {
              acta_id: actaConciliando.acta_id,
              generacion_residuo_id: nuevaGeneracion.id,
              peso_reportado: residuo.peso_reportado,
              peso_conciliado: residuo.peso_conciliado,
            },
          });
        } else {
          // RESIDUO EXISTENTE: Actualizar
          await apiRequest(`/actas-generacion-residuo/${residuo.acta_generacion_residuo_id}/`, {
            method: "PATCH",
            body: {
              peso_conciliado: residuo.peso_conciliado,
            },
          });

          if (residuo.generacion_residuo_id) {
            const generacionData: any = {};
            
            if (residuo.residuo_id && residuo.residuo_id > 0) {
              generacionData.residuo_id = residuo.residuo_id;
            }
            
            if (residuo.motivo) {
              generacionData.motivo = residuo.motivo;
            }
            
            if (residuo.residuo_otro !== undefined) {
              generacionData.residuo_otro = residuo.residuo_otro;
            }
            
            if (residuo.motivo_otro !== undefined) {
              generacionData.motivo_otro = residuo.motivo_otro;
            }
            
            if (residuo.peso_reportado !== undefined) {
              generacionData.peso = residuo.peso_reportado;
            }
            
            if (Object.keys(generacionData).length > 0) {
              await apiRequest(`/generacion-residuo/${residuo.generacion_residuo_id}/`, {
                method: "PATCH",
                body: generacionData,
              });
            }
          }
        }
      }

      // 4. ELIMINAR NOVEDADES (si existen)
      try {
        const novedades = await apiRequest<any[]>("/novedad-conciliacion/", {
          method: "GET",
        });

        const novedadesDelActa = novedades.filter((n) =>
          residuosEditables.some(
            (r) => r.acta_generacion_residuo_id === n.acta_generacion_residuo_id
          )
        );

        for (const novedad of novedadesDelActa) {
          await apiRequest(`/novedad-conciliacion/${novedad.id}/`, {
            method: "DELETE",
          });
        }
      } catch (err) {
        console.warn("No se pudieron eliminar novedades:", err);
      }

      alert("✅ Acta conciliada exitosamente. La novedad ha sido resuelta.");
      
      // Recargar actas
      await cargarActas();
      cerrarModalConciliar();

    } catch (err: any) {
      console.error("❌ Error guardando conciliación:", err);
      
      if (err.message.includes("405")) {
        alert("Error 405: PATCH no permitido. El backend no tiene configurado el método.");
      } else if (err.message.includes("400")) {
        alert("Error 400: Datos inválidos. Verifica los campos requeridos.");
      } else if (err.message.includes("404")) {
        alert("Error 404: Recurso no encontrado. Verifica que los IDs sean correctos.");
      } else {
        alert(`Error al guardar: ${err.message || "Error desconocido"}`);
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue text-center mb-8">
        Actas Conciliadas – Punto Verde
      </h1>

      {/* BOTÓN DE EXPORTAR A EXCEL */}
      <div className="flex justify-end mb-4">
        <Button
          variant="success"
          onClick={exportarAExcel}
          className="flex items-center gap-2"
        >
          <span className="text-xl">📊</span>
          Exportar a Excel
        </Button>
      </div>

      {/* TABS */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={filtroTab === "conciliadas" ? "primary" : "secondary"}
          onClick={() => setFiltroTab("conciliadas")}
        >
          Conciliadas
        </Button>
        <Button
          variant={filtroTab === "pendientes" ? "primary" : "secondary"}
          onClick={() => setFiltroTab("pendientes")}
        >
          Pendientes
        </Button>
        <Button
          variant={filtroTab === "novedad" ? "warning" : "secondary"}
          onClick={() => setFiltroTab("novedad")}
        >
          Con Novedad ⚠️
        </Button>
      </div>

      {/* FILTROS */}
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

      {/* ERRORES */}
      {error && (
        <p className="text-center text-red-500 bg-red-100 p-3 rounded mb-4">
          {error}
        </p>
      )}

      {/* LISTA DE ACTAS */}
{loading ? (
  <p className="text-center mt-10 text-gray-500">Cargando...</p>
) : actasFiltradas.length === 0 ? (
  <p className="text-center mt-10 text-gray-400">No hay actas.</p>
) : (
  <div className="space-y-8">
    {actasFiltradas.map((acta) => {
      const pesoConciliado = calcularPesoTotal(acta.residuos);
      const pesoReportado = acta.residuos.reduce(
        (sum, r) => sum + Number(r.peso_reportado ?? 0),
        0
      );
      
      const estilos = getEstilosPorEstado(acta.tipo);
      const textoEstado = getTextoEstado(acta.tipo);
      const hoverEstilos = getHoverPorEstado(acta.tipo);

      return (
        <div
          key={acta.id}
          className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition border-l-4 ${estilos.borderColor} ${hoverEstilos}`}
        >
          {/* ENCABEZADO CON BADGE DE ESTADO */}
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`text-2xl ${estilos.textColor}`}>
                {estilos.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                  Acta #{acta.numero_acta}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${estilos.badgeColor}`}>
                    {textoEstado}
                  </span>
                  <p className="text-gray-600 dark:text-gray-400">
                    📅{" "}
                    {new Date(acta.fecha_acta).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Peso Reportado
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {pesoReportado.toFixed(2)} kg
                </p>
              </div>

              {acta.tipo !== "pendiente" && (
                <div className={`${estilos.bgColor} px-4 py-2 rounded-lg`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Peso Conciliado
                  </p>
                  <p className={`text-2xl font-bold ${estilos.pesoColor}`}>
                    {pesoConciliado.toFixed(2)} kg
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* INFORMACIÓN ADICIONAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm text-gray-700 dark:text-gray-300">
            {acta.consecutivo && (
              <p>
                <span className="font-semibold">Consecutivo:</span>{" "}
                {acta.consecutivo}
              </p>
            )}
            {acta.numero_inventario && (
              <p>
                <span className="font-semibold">Número de Inventario:</span>{" "}
                {acta.numero_inventario}
              </p>
            )}
            <p>
              <span className="font-semibold">Subárea:</span>{" "}
              {acta.subarea_nombre ?? "Sin subárea"}
            </p>
            <p>
              <span className="font-semibold">Centro de Costo:</span>{" "}
              {acta.centro_costo_codigo
                ? `${acta.centro_costo_codigo}${
                    acta.centro_costo_nombre
                      ? ` – ${acta.centro_costo_nombre}`
                      : ""
                  }`
                : "Sin centro de costo"}
            </p>
          </div>

          {/* OPERARIO (Entrega) */}
          {acta.operario_documento && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">👤 Operario (Entrega)</h3>
              <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cédula
                  </p>
                  <p className="font-semibold">
                    {acta.operario_documento || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nombre
                  </p>
                  <p className="font-semibold">
                    {acta.operario_nombre || "Sin nombre registrado"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CONCILIADOR (Recepción) - MOSTRAR SIEMPRE */}
          <div className={`mb-6 ${estilos.bgColor} p-4 rounded-lg`}>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span>👤</span>
              <span>Conciliador (Recepción)</span>
              <span className={`text-sm px-2 py-1 rounded ${estilos.badgeColor}`}>
                {textoEstado} {estilos.icon}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cédula</p>
                <p className="font-semibold">
                  {acta.conciliador_documento ? acta.conciliador_documento : "No registrada"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                <p className="font-semibold">
                  {acta.conciliador_nombre || "Sin nombre registrado"}
                </p>
              </div>
            </div>
            
            {/* Fecha de conciliación - SOLO PARA ACTAS CONCILIADAS */}
            {acta.tipo === "conciliada" && acta.fecha_conciliacion && (
              <div className={`mt-3 pt-3 border-t ${estilos.borderColor}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Conciliación</p>
                <p className="font-semibold">
                  {new Date(acta.fecha_conciliacion).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* NOVEDAD - SOLO PARA ACTAS CON NOVEDAD */}
          {acta.tipo === "con_novedad" && acta.novedad && (
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
                  onClick={() => abrirModalResolverNovedad(acta)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition flex items-center gap-2"
                >
                  <span>🔧</span>
                  Resolver Novedad
                </button>
              </div>
            </div>
          )}

          {/* TABLA DE RESIDUOS */}
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
                r.motivo === "Otro"
                  ? `Otro – ${r.descripcion_motivo_otro ?? ""}`
                  : r.motivo,
            }))}
          />

          {/* BOTONES DE EDICIÓN Y ELIMINACIÓN */}
          {(acta.tipo === "conciliada" || acta.tipo === "pendiente") && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => handleEditarActa(acta)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                title="Editar acta"
              >
                <span className="text-lg">✏️</span>
                <span>Editar Acta</span>
              </button>
              <button
                onClick={() => abrirModalEliminar(acta)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                title="Eliminar acta"
              >
                <span className="text-lg">🗑️</span>
                <span>Eliminar Acta</span>
              </button>
            </div>
          )}
        </div>
      );
    })}
  </div>
)}
      {/* MODAL PARA CONCILIAR NOVEDADES */}
      {modalConciliarAbierto && actaConciliando && (
        <ModalEdicionActa
          actaEditando={actaConciliando}
          residuosEditables={residuosEditables}
          residuosFiltrados={residuosFiltrados}
          motivosFiltrados={motivosFiltrados}
          
          // Catálogos
          subareas={subareas}
          centrosCosto={centrosCosto}
          operarios={operarios} // Todos los operarios (para selección de operario entrega)
          operariosPuntoVerde={operariosPuntoVerde} // Solo operarios de punto verde (para conciliador)
          
          guardando={guardando}
          onClose={cerrarModalConciliar}
          onGuardar={handleGuardarConciliacion}
          
          // Funciones básicas
          onCambioPesoConciliado={handleCambioPesoConciliado}
          onCambioResiduo={handleCambioResiduo}
          onCambioMotivo={handleCambioMotivo}
          
          // Funciones para campos adicionales
          onCambioSubarea={handleCambioSubarea}
          onCambioCentroCosto={handleCambioCentroCosto}
          onCambioOperario={handleCambioOperario}
          
          // Funciones para conciliador
          onCambioConciliador={handleCambioConciliador}
          
          // Funciones existentes
          onCambioConsecutivo={handleCambioConsecutivo}
          onCambioNumeroInventario={handleCambioNumeroInventario}
          onCambioOperarioDocumento={handleCambioOperarioDocumento}
          onCambioConciliadorDocumento={handleCambioConciliadorDocumento}
          
          // Funciones para manejar residuos
          onAgregarResiduo={handleAgregarResiduo}
          onEliminarResiduo={handleEliminarResiduo}
          onCambioPesoReportado={handleCambioPesoReportado}
          onCambioDescripcionResiduoOtro={handleCambioDescripcionResiduoOtro}
          onCambioDescripcionMotivoOtro={handleCambioDescripcionMotivoOtro}
          
          // Validaciones
          validarSoloNumeros={validarSoloNumeros}
          validarMaximoDigitos={validarMaximoDigitos}
          
          // Configuración
          modo="conciliacion"
          esNovedad={actaConciliando.tipo === "con_novedad"}
          permiteEditarTodo={true}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {modalEliminarAbierto && actaAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              Confirmar Eliminación
            </h3>
            
            <p className="mb-6">
              ¿Estás seguro de que deseas eliminar el Acta #{actaAEliminar.numero_acta}?
              <br />
              <span className="text-sm text-gray-500">
                Esta acción no se puede deshacer.
              </span>
            </p>

            <div className="flex justify-end gap-4">
              <Button
                variant="secondary"
                onClick={cerrarModalEliminar}
                disabled={eliminando}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleEliminarActa}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}