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
import { obtenerResiduosEspecificos, obtenerCategoriasResiduos } from "../../services/catalogo.service";

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

  // Modal de edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [actaEditando, setActaEditando] = useState<ConciliacionExtendida | null>(null);
  const [residuosEditables, setResiduosEditables] = useState<ResiduoEditable[]>([]);
  const [guardando, setGuardando] = useState(false);
  
  // Estados para selects filtrados
  const [residuosFiltrados, setResiduosFiltrados] = useState<any[]>([]);
  const [categoriasResiduos, setCategoriasResiduos] = useState<any[]>([]);
  const [residuosEspecificos, setResiduosEspecificos] = useState<any[]>([]);
  const [motivosFiltrados] = useState([
    { id: 1, nombre: 'Bloqueado' },
    { id: 2, nombre: 'Obsoleto' },
    { id: 3, nombre: 'Rechazado' },
    { id: 4, nombre: 'Vencido' },
    { id: 5, nombre: 'Otro' },
  ]);
  const [cargandoResiduos, setCargandoResiduos] = useState(false);

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
      const [residuosData, categoriasData] = await Promise.all([
        obtenerResiduosEspecificos(),
        obtenerCategoriasResiduos()
      ]);
      setResiduosEspecificos(residuosData);
      setCategoriasResiduos(categoriasData);
    } catch (error) {
      console.error("Error cargando catálogos:", error);
    }
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

  // ---- MODAL DE EDICIÓN ----
  const abrirModalEdicion = async (acta: ConciliacionExtendida) => {
    setActaEditando(acta);
    
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
          descripcion_residuo_otro: r.descripcion_residuo_otro,
          descripcion_motivo_otro: r.descripcion_motivo_otro,
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
      
      setModalAbierto(true);
    } catch (error) {
      console.error("Error cargando relaciones:", error);
      alert("Error al cargar datos para edición");
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setActaEditando(null);
    setResiduosEditables([]);
    setResiduosFiltrados([]);
  };

  // ---- FUNCIONES DE MANEJO DE CAMBIOS ----
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
    if (!actaEditando) return;
    setActaEditando({
      ...actaEditando,
      consecutivo: valor
    } as ConciliacionExtendida);
  };

  const handleCambioNumeroInventario = (valor: string | null) => {
    if (!actaEditando) return;
    setActaEditando({
      ...actaEditando,
      numero_inventario: valor
    } as ConciliacionExtendida);
  };

  const handleCambioOperarioDocumento = (valor: string) => {
    if (!actaEditando) return;
    setActaEditando({
      ...actaEditando,
      operario_documento: valor
    });
  };

  const handleCambioConciliadorDocumento = (valor: string) => {
    if (!actaEditando) return;
    setActaEditando({
      ...actaEditando,
      conciliador_documento: valor
    });
  };

  // ---- GUARDAR CONCILIACIÓN ----
  const handleGuardarConciliacion = async () => {
    if (!actaEditando) return;

    try {
      setGuardando(true);

      // Validar pesos
      for (const residuo of residuosEditables) {
        if (!residuo.peso_conciliado || parseFloat(residuo.peso_conciliado) <= 0) {
          alert("Todos los residuos deben tener un peso conciliado mayor a 0");
          return;
        }
      }

      // Validar documentos - AHORA INCLUYENDO DOCUMENTO_RECEPCION DEL BACKEND
      const operarioDoc = actaEditando.operario_documento?.toString() || "";
      if (!operarioDoc || !validarSoloNumeros(operarioDoc)) {
        alert("El documento del operario es requerido y solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(operarioDoc, 10)) {
        alert("El documento del operario no puede tener más de 10 dígitos");
        return;
      }

      // Obtener documento del conciliador: primero de conciliador_documento, si no del acta original
      const conciliadorDoc = actaEditando.conciliador_documento?.toString() || "";
      if (!conciliadorDoc || !validarSoloNumeros(conciliadorDoc)) {
        alert("El documento del conciliador es requerido y solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(conciliadorDoc, 10)) {
        alert("El documento del conciliador no puede tener más de 10 dígitos");
        return;
      }

      // Validar consecutivo e inventario
      if (!validarSoloNumeros(actaEditando.consecutivo)) {
        alert("El consecutivo solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(actaEditando.consecutivo, 6)) {
        alert("El consecutivo no puede tener más de 6 dígitos");
        return;
      }

      if (!validarSoloNumeros(actaEditando.numero_inventario)) {
        alert("El número de inventario solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(actaEditando.numero_inventario, 11)) {
        alert("El número de inventario no puede tener más de 11 dígitos");
        return;
      }

      // 1. PREPARAR ACTA PARA ACTUALIZAR - USAR DOCUMENTO_RECEPCION
      const actaActualizada: any = {
        documento_entrega: actaEditando.operario_documento,
        documento_recepcion: conciliadorDoc, // Usar el documento del conciliador
        fecha_conciliacion: new Date().toISOString(),
      };

      // Manejar consecutivo
      if (actaEditando.consecutivo !== undefined && actaEditando.consecutivo !== null) {
        const consecutivoStr = actaEditando.consecutivo.toString().trim();
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
      if (actaEditando.numero_inventario !== undefined && actaEditando.numero_inventario !== null) {
        const inventarioStr = actaEditando.numero_inventario.toString().trim();
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
      await apiRequest(`/actas/${actaEditando.acta_id}/`, {
        method: "PATCH",
        body: actaActualizada,
      });

      // 3. ACTUALIZAR CADA RESIDUO
      for (const residuo of residuosEditables) {
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
          
          if (Object.keys(generacionData).length > 0) {
            await apiRequest(`/generacion-residuo/${residuo.generacion_residuo_id}/`, {
              method: "PATCH",
              body: generacionData,
            });
          }
        }
      }

      // 4. ELIMINAR NOVEDADES
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

      alert("✅ Acta actualizada exitosamente. La novedad ha sido resuelta y el acta está conciliada.");
      
      // Recargar actas
      await cargarActas();
      cerrarModal();

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

  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue text-center mb-8">
        Actas Conciliadas – Punto Verde
      </h1>

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

            return (
              <div
                key={acta.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                {/* ENCABEZADO */}
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                      Acta #{acta.numero_acta}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
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
                      <div className="bg-skyBlue/10 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Peso Conciliado
                        </p>
                        <p className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
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
               {/* CONCILIADOR (Recepción) - MOSTRAR SIEMPRE */}
<div className="mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
  <h3 className="text-lg font-bold mb-2">
    👤 Conciliador (Recepción)
    <span className="ml-2 text-sm bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded">
      {acta.tipo === "conciliada" ? "✓ Conciliada" : 
       acta.tipo === "pendiente" ? "⏳ Pendiente" : 
       acta.tipo === "con_novedad" ? "⚠️ Con Novedad" : "Sin estado"}
    </span>
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">Cédula</p>
      <p className="font-semibold">
        {/* Mostrar el documento del conciliador, si no hay, mostrar un mensaje */}
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
    <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
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

                {/* NOVEDAD */}
                {acta.novedad && (
                  <div className="mb-6 bg-yellow-100 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold mb-2">⚠️ Novedad</h3>
                        <p>{acta.novedad}</p>
                      </div>
                      <button
                        onClick={() => abrirModalEdicion(acta)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
                      >
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
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE EDICIÓN */}
      {modalAbierto && actaEditando && (
        <ModalEdicionActa
          actaEditando={actaEditando}
          residuosEditables={residuosEditables}
          residuosFiltrados={residuosFiltrados}
          motivosFiltrados={motivosFiltrados}
          guardando={guardando}
          onClose={cerrarModal}
          onGuardar={handleGuardarConciliacion}
          onCambioPesoConciliado={handleCambioPesoConciliado}
          onCambioResiduo={handleCambioResiduo}
          onCambioMotivo={handleCambioMotivo}
          onCambioConsecutivo={handleCambioConsecutivo}
          onCambioNumeroInventario={handleCambioNumeroInventario}
          onCambioOperarioDocumento={handleCambioOperarioDocumento}
          onCambioConciliadorDocumento={handleCambioConciliadorDocumento}
          validarSoloNumeros={validarSoloNumeros}
          validarMaximoDigitos={validarMaximoDigitos}
        />
      )}
    </div>
  );
}