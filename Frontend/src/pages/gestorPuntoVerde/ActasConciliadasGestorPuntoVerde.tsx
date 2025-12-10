import TableResiduosActa from "../../components/common/TableResiduosActa";
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
};

type ActaEditable = {
  subarea_id?: number;
  centro_costo_id?: number;
  consecutivo?: string;
  numero_inventario?: string;
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

  // ---- FUNCIONES PARA FILTRAR RESIDUOS (igual que en NuevaActa) ----
  const obtenerResiduosFiltrados = (subAreaId?: number | null) => {
    if (!subAreaId) return [];
    
    // 1. Obtener categorías de la subárea
    const categoriasDeSubArea = categoriasResiduos.filter(
      cat => cat.subarea_id === subAreaId
    );
    
    // 2. Obtener IDs de categorías
    const categoriaIds = categoriasDeSubArea.map(cat => cat.id);
    
    // 3. Filtrar residuos específicos por categoría
    return residuosEspecificos.filter(
      res => categoriaIds.includes(res.categoria_id)
    );
  };

  const obtenerCategoriasFiltradas = (subAreaId?: number | null) => {
    if (!subAreaId) return [];
    return categoriasResiduos.filter(cat => cat.subarea_id === subAreaId);
  };

  // ---- FUNCIONES DE VALIDACIÓN ----
  const validarSoloNumeros = (valor: string) => {
    return /^\d*$/.test(valor);
  };

  const validarMaximoDigitos = (valor: string, maxDigitos: number) => {
    return valor.length <= maxDigitos;
  };

  // ---- MODAL DE EDICIÓN ----
  const abrirModalEdicion = async (acta: ConciliacionExtendida) => {
    setActaEditando(acta);
    
    // Convertir residuos a formato editable
    const residuosEdit: ResiduoEditable[] = acta.residuos.map((r) => {
      // Buscar el residuo específico para obtener categoria_id
      const residuoEspecifico = residuosEspecificos.find(
        res => res.nombre === r.residuo_nombre || 
               (r.residuo_nombre.includes("Otro") && res.nombre === "Otro")
      );
      
      return {
        acta_generacion_residuo_id: r.acta_generacion_residuo_id || 0,
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
    
    // Cargar residuos filtrados por subárea
    if (acta.subarea_id) {
      const residuosFiltrados = obtenerResiduosFiltrados(acta.subarea_id);
      setResiduosFiltrados(residuosFiltrados);
    }
    
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setActaEditando(null);
    setResiduosEditables([]);
    setResiduosFiltrados([]);
  };

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
    
    // Si se selecciona "Otro", mantener la descripción actual o inicializar vacía
    if (residuoSeleccionado?.nombre === "Otro") {
      nuevosResiduos[index].residuo_otro = nuevosResiduos[index].descripcion_residuo_otro || "";
    } else {
      nuevosResiduos[index].residuo_otro = null;
      nuevosResiduos[index].descripcion_residuo_otro = "";
    }
    
    setResiduosEditables(nuevosResiduos);
  };

 const handleGuardarConciliacion = async () => {
  if (!actaEditando) return;

  try {
    setGuardando(true);

    // Validar que todos los pesos sean válidos
    for (const residuo of residuosEditables) {
      if (!residuo.peso_conciliado || parseFloat(residuo.peso_conciliado) <= 0) {
        alert("Todos los residuos deben tener un peso conciliado mayor a 0");
        return;
      }
    }

    // Validar documentos (solo números, máximo 10 dígitos)
    if (!actaEditando.operario_documento || !validarSoloNumeros(actaEditando.operario_documento)) {
      alert("El documento del operario es requerido y solo debe contener números");
      return;
    }

    if (!validarMaximoDigitos(actaEditando.operario_documento, 10)) {
      alert("El documento del operario no puede tener más de 10 dígitos");
      return;
    }

    if (!actaEditando.conciliador_documento || !validarSoloNumeros(actaEditando.conciliador_documento)) {
      alert("El documento del conciliador es requerido y solo debe contener números");
      return;
    }

    if (!validarMaximoDigitos(actaEditando.conciliador_documento, 10)) {
      alert("El documento del conciliador no puede tener más de 10 dígitos");
      return;
    }

    // Validar consecutivo (solo números, máximo 6 dígitos)
    if (actaEditando.consecutivo && actaEditando.consecutivo.trim() !== "") {
      if (!validarSoloNumeros(actaEditando.consecutivo)) {
        alert("El consecutivo solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(actaEditando.consecutivo, 6)) {
        alert("El consecutivo no puede tener más de 6 dígitos");
        return;
      }
    }

    // Validar número de inventario (solo números, máximo 11 dígitos)
    if (actaEditando.numero_inventario && actaEditando.numero_inventario.trim() !== "") {
      if (!validarSoloNumeros(actaEditando.numero_inventario)) {
        alert("El número de inventario solo debe contener números");
        return;
      }
      if (!validarMaximoDigitos(actaEditando.numero_inventario, 11)) {
        alert("El número de inventario no puede tener más de 11 dígitos");
        return;
      }
    }

    // 1. PREPARAR SOLO LOS CAMPOS QUE QUEREMOS ACTUALIZAR
    const actaActualizada: any = {
      documento_entrega: actaEditando.operario_documento,
      documento_recepcion: actaEditando.conciliador_documento,
      fecha_conciliacion: new Date().toISOString(),
    };

    // Manejar consecutivo
    if (actaEditando.consecutivo && actaEditando.consecutivo.trim() !== "") {
      const consecutivoNum = parseInt(actaEditando.consecutivo, 10);
      actaActualizada.consecutivo = !isNaN(consecutivoNum) ? consecutivoNum : null;
    }

    // Manejar número de inventario
    if (actaEditando.numero_inventario && actaEditando.numero_inventario.trim() !== "") {
      const inventarioNum = parseInt(actaEditando.numero_inventario, 10);
      actaActualizada.numero_inventario = !isNaN(inventarioNum) ? inventarioNum : null;
    }

    console.log("Enviando datos actualizados del acta:", actaActualizada);

    // 2. ACTUALIZAR EL ACTA con PATCH (actualización parcial)
    await apiRequest(`/actas/${actaEditando.acta_id}/`, {
      method: "PATCH",
      body: actaActualizada,
    });

    // 3. ACTUALIZAR CADA RESIDUO (solo peso conciliado)
    for (const residuo of residuosEditables) {
      console.log(`Actualizando residuo ${residuo.acta_generacion_residuo_id} con peso:`, residuo.peso_conciliado);
      
      await apiRequest(`/actas-generacion-residuo/${residuo.acta_generacion_residuo_id}/`, {
        method: "PATCH",
        body: {
          peso_conciliado: residuo.peso_conciliado,
        },
      });
    }

    // 4. ELIMINAR LA NOVEDAD
    const novedades = await apiRequest<any[]>("/novedad-conciliacion/", {
      method: "GET",
    });

    const novedadesDelActa = novedades.filter((n) =>
      residuosEditables.some(
        (r) => r.acta_generacion_residuo_id === n.acta_generacion_residuo_id
      )
    );

    console.log(`Encontradas ${novedadesDelActa.length} novedades para eliminar`);

    for (const novedad of novedadesDelActa) {
      await apiRequest(`/novedad-conciliacion/${novedad.id}/`, {
        method: "DELETE",
      });
    }

    alert("✓ Acta actualizada exitosamente. La novedad ha sido resuelta y el acta está conciliada.");
    
    // Recargar actas
    await cargarActas();
    cerrarModal();

  } catch (err: any) {
    console.error("Error guardando conciliación:", err);
    alert(`Error al guardar: ${err.message || "Error desconocido"}`);
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

      {/* ------------------ TABS ------------------ */}
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

      {/* ------------------ FILTROS ------------------ */}
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

      {/* ------------------ ERRORES ------------------ */}
      {error && (
        <p className="text-center text-red-500 bg-red-100 p-3 rounded mb-4">
          {error}
        </p>
      )}

      {/* ------------------ LISTA ------------------ */}
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
                    {/* Peso Reportado */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Peso Reportado
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {pesoReportado.toFixed(2)} kg
                      </p>
                    </div>

                    {/* Peso Conciliado */}
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

                {/* 🔵 INFORMACIÓN ADICIONAL DEL ACTA */}
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

                {/* 👤 OPERARIO */}
                {acta.operario_nombre && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">👤 Operario</h3>
                    <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cédula
                        </p>
                        <p className="font-semibold">
                          {acta.operario_documento ?? "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Nombre
                        </p>
                        <p className="font-semibold">{acta.operario_nombre}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 👤 CONCILIADOR */}
                {acta.conciliador_nombre && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">
                      👤 Conciliador
                    </h3>
                    <div className="grid grid-cols-2 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cédula
                        </p>
                        <p className="font-semibold">
                          {acta.conciliador_documento ?? "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Nombre
                        </p>
                        <p className="font-semibold">
                          {acta.conciliador_nombre}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ⚠️ NOVEDAD con botón de editar */}
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

      {/* ------------------ MODAL DE EDICIÓN ------------------ */}
      {modalAbierto && actaEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                    Editar Acta #{actaEditando.numero_acta} - Resolver Novedad
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Edita todos los campos y ajusta los pesos conciliados. Al guardar, el acta será marcada como conciliada.
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Información general del acta */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Número Acta *</label>
                  <input
                    type="text"
                    value={actaEditando.numero_acta}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                    readOnly
                    title="El número de acta no se puede modificar"
                  />
                  <p className="text-xs text-gray-500 mt-1">No editable</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Consecutivo (opcional)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="999999"
                    value={actaEditando.consecutivo || ""}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (validarSoloNumeros(valor) && validarMaximoDigitos(valor, 6)) {
                        setActaEditando({
                          ...actaEditando,
                          consecutivo: valor
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Máx 6 dígitos"
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo números, máximo 6 dígitos</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">N° Inventario (opcional)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="99999999999"
                    value={actaEditando.numero_inventario || ""}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (validarSoloNumeros(valor) && validarMaximoDigitos(valor, 11)) {
                        setActaEditando({
                          ...actaEditando,
                          numero_inventario: valor
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Máx 11 dígitos"
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo números, máximo 11 dígitos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Acta *</label>
                  <input
                    type="datetime-local"
                    value={new Date(actaEditando.fecha_acta).toISOString().slice(0, 16)}
                    onChange={(e) => setActaEditando({
                      ...actaEditando,
                      fecha_acta: e.target.value
                    })}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">No editable</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Documento Operario (Entrega) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={actaEditando.operario_documento || ""}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (validarSoloNumeros(valor) && validarMaximoDigitos(valor, 10)) {
                        setActaEditando({
                          ...actaEditando,
                          operario_documento: valor
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo números, máximo 10 dígitos</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Documento Conciliador (Recepción) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={actaEditando.conciliador_documento || ""}
                    onChange={(e) => {
                      const valor = e.target.value;
                      if (validarSoloNumeros(valor) && validarMaximoDigitos(valor, 10)) {
                        setActaEditando({
                          ...actaEditando,
                          conciliador_documento: valor
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo números, máximo 10 dígitos</p>
                </div>
              </div>

              {/* Mostrar novedad */}
              {actaEditando.novedad && (
                <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">⚠️ Descripción de la novedad original:</h3>
                  <p>{actaEditando.novedad}</p>
                </div>
              )}

              {/* Tabla de residuos editable */}
              <div className="overflow-x-auto">
                <table className="min-w-full border dark:border-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Residuo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Descripción (si es "Otro")</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Motivo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Descripción Motivo (si es "Otro")</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Peso Reportado (kg)</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Peso Conciliado (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {residuosEditables.map((residuo, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <select
                            value={residuo.residuo_id}
                            onChange={(e) => handleCambioResiduo(index, parseInt(e.target.value))}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="">Seleccione un residuo</option>
                            {residuosFiltrados.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.nombre}
                              </option>
                            ))}
                          </select>
                          {residuosFiltrados.length === 0 && (
                            <p className="text-xs text-yellow-600 mt-1">
                              No hay residuos disponibles para esta subárea
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {residuosEditables[index].residuo_nombre === "Otro" ? (
                            <input
                              type="text"
                              value={residuo.descripcion_residuo_otro || ""}
                              onChange={(e) => {
                                const nuevosResiduos = [...residuosEditables];
                                nuevosResiduos[index].descripcion_residuo_otro = e.target.value;
                                nuevosResiduos[index].residuo_otro = e.target.value;
                                setResiduosEditables(nuevosResiduos);
                              }}
                              placeholder="Descripción del residuo..."
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">No aplica</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={residuo.motivo}
                            onChange={(e) => {
                              const nuevosResiduos = [...residuosEditables];
                              nuevosResiduos[index].motivo = e.target.value;
                              
                              if (e.target.value === "Otro") {
                                nuevosResiduos[index].motivo_otro = residuo.descripcion_motivo_otro || "";
                              }
                              
                              setResiduosEditables(nuevosResiduos);
                            }}
                            className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="">Seleccione un motivo</option>
                            {motivosFiltrados.map((m) => (
                              <option key={m.id} value={m.nombre}>
                                {m.nombre}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          {residuosEditables[index].motivo === "Otro" ? (
                            <input
                              type="text"
                              value={residuo.descripcion_motivo_otro || ""}
                              onChange={(e) => {
                                const nuevosResiduos = [...residuosEditables];
                                nuevosResiduos[index].descripcion_motivo_otro = e.target.value;
                                nuevosResiduos[index].motivo_otro = e.target.value;
                                setResiduosEditables(nuevosResiduos);
                              }}
                              placeholder="Descripción del motivo..."
                              className="w-full px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">No aplica</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {parseFloat(residuo.peso_reportado).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={residuo.peso_conciliado}
                            onChange={(e) =>
                              handleCambioPesoConciliado(index, e.target.value)
                            }
                            className="w-32 px-2 py-1 border rounded text-right dark:bg-gray-700 dark:border-gray-600"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm font-bold">
                        TOTAL
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right">
                        {residuosEditables
                          .reduce((sum, r) => sum + parseFloat(r.peso_reportado), 0)
                          .toFixed(2)}{" "}
                        kg
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-right">
                        {residuosEditables
                          .reduce(
                            (sum, r) => sum + parseFloat(r.peso_conciliado || "0"),
                            0
                          )
                          .toFixed(2)}{" "}
                        kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ⓘ Al guardar, la novedad será eliminada y el acta quedará como <span className="font-bold text-green-600">CONCILIADA</span>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={cerrarModal}
                  disabled={guardando}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarConciliacion}
                  disabled={guardando}
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Guardando...
                    </>
                  ) : (
                    "✓ Guardar Cambios y Conciliar Acta"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}