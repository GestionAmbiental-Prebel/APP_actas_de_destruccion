// pages/EditarActaPage.tsx - VERSIÓN CORREGIDA
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api.service";
import {
  obtenerSubAreas,
  obtenerCentrosCosto,
  obtenerResiduosEspecificos,
  obtenerCategoriasResiduos,
  obtenerAreas,
  obtenerProcedencias,
  obtenerSedes,
} from "../../services/catalogo.service";
import { obtenerOperarios } from "../../services/operarios.service";
import SeccionUbicacion from "../../components/form/SeccionUbicacion";
import SeccionResiduos, { Residuo } from "../../components/form/SeccionResiduos";

// Tipo para manejar residuos con información de la base de datos
type ResiduoConIds = Residuo & {
  generacion_residuo_id?: number | null;
  acta_generacion_residuo_id?: number | null;
  peso_conciliado?: string | null;
};

// Definir los mismos grupos que en SeccionResiduos
const GRUPOS_RESIDUOS_CON_MOTIVO = [
  'Granel',
  'Materia Prima',
  'Esmaltes',
  'Aerosoles',
  'Fragancias',
  'Vidrio',
  'Plega',
  'Pasta',
  'Metalico',
  'Producto Terminado',
  'Otro'
];

export default function EditarActaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tipoActa, setTipoActa] = useState<string>("");
  const [showAreaChangeModal, setShowAreaChangeModal] = useState(false);
  const [pendingSubareaId, setPendingSubareaId] = useState<number | null>(null);

  // Datos del acta
  const [numeroActa, setNumeroActa] = useState("");
  const [fechaActa, setFechaActa] = useState("");
  const [consecutivo, setConsecutivo] = useState("");
  const [numeroInventario, setNumeroInventario] = useState("");
  const [subareaId, setSubareaId] = useState<number | null>(null);
  const [centroCostoId, setCentroCostoId] = useState<number | null>(null);
  
  // Operarios
  const [operarioDocumentoEntrega, setOperarioDocumentoEntrega] = useState("");
  const [operarioNombreEntrega, setOperarioNombreEntrega] = useState("");
  const [operarioDocumentoRecepcion, setOperarioDocumentoRecepcion] = useState("");
  const [operarioNombreRecepcion, setOperarioNombreRecepcion] = useState("");
  const [operarioId, setOperarioId] = useState<number>(0);

  // Residuos con IDs de la base de datos
  const [residuos, setResiduos] = useState<ResiduoConIds[]>([]);
  const [residuosEliminados, setResiduosEliminados] = useState<number[]>([]);

  // Catálogos
  const [subareas, setSubareas] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [procedencias, setProcedencias] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [todosLosResiduos, setTodosLosResiduos] = useState<any[]>([]);
  const [todasLasCategorias, setTodasLasCategorias] = useState<any[]>([]);
  const [operarios, setOperarios] = useState<any[]>([]);

  // Motivos
  const motivos = ['Bloqueado', 'Obsoleto', 'Rechazado', 'Vencido', 'Otro'];

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      // Cargar catálogos
      const [
        subAreasData,
        centrosCostoData,
        residuosData,
        categoriasData,
        operariosData,
        areasData,
        procedenciasData,
        sedesData,
      ] = await Promise.all([
        obtenerSubAreas(),
        obtenerCentrosCosto(),
        obtenerResiduosEspecificos(),
        obtenerCategoriasResiduos(),
        obtenerOperarios(),
        obtenerAreas(),
        obtenerProcedencias(),
        obtenerSedes(),
      ]);

      setSubareas(subAreasData);
      setAreas(areasData);
      setProcedencias(procedenciasData);
      setSedes(sedesData);
      setCentrosCosto(centrosCostoData);
      setTodosLosResiduos(residuosData);
      setTodasLasCategorias(categoriasData);
      setOperarios(operariosData);

      // Cargar el acta
      const acta = await apiRequest<any>(`/actas/${id}/`, { method: "GET" });

      setNumeroActa(acta.numero_acta);
      setFechaActa(acta.fecha_acta);
      setConsecutivo(acta.consecutivo || "");
      setNumeroInventario(acta.numero_inventario || "");
      setSubareaId(acta.subarea_id);
      setCentroCostoId(acta.centro_costo_id);
      
      // Operario que registró el acta
      setOperarioDocumentoEntrega(acta.documento_entrega);
      
      // Operario que concilió el acta (si existe)
      setOperarioDocumentoRecepcion(acta.documento_recepcion || "");
      
      // Determinar el tipo del acta basado en los datos
      let tipo = "pendiente";
      if (acta.documento_recepcion) {
        tipo = "conciliada";
      }
      setTipoActa(tipo);

      // Buscar operario que registró el acta
      const operarioEntrega = operariosData.find(
        (o: any) => o.documento === acta.documento_entrega
      );
      if (operarioEntrega) {
        setOperarioNombreEntrega(`${operarioEntrega.nombre} ${operarioEntrega.apellido || ""}`.trim());
        setOperarioId(operarioEntrega.id);
      }

      // Buscar operario que concilió el acta (si existe)
      if (acta.documento_recepcion) {
        const operarioRecepcion = operariosData.find(
          (o: any) => o.documento === acta.documento_recepcion
        );
        if (operarioRecepcion) {
          setOperarioNombreRecepcion(`${operarioRecepcion.nombre} ${operarioRecepcion.apellido || ""}`.trim());
        }
      }

      // Cargar residuos del acta CON SUS IDs DE LA BASE DE DATOS
      const relaciones = await apiRequest<any[]>("/actas-generacion-residuo/", {
        method: "GET",
      });
      const relacionesDelActa = relaciones.filter(
        (r: any) => r.acta_id === parseInt(id!)
      );

      const generaciones = await apiRequest<any[]>("/generacion-residuo/", {
        method: "GET",
      });

      const residuosCargados: ResiduoConIds[] = [];
      for (const rel of relacionesDelActa) {
        const gen = generaciones.find(
          (g: any) => g.id === rel.generacion_residuo_id
        );
        if (gen) {
          const resEsp = residuosData.find((r: any) => r.id === gen.residuo_id);
          
          // Para actas conciliadas, el peso_conciliado es el mismo que peso_reportado
          const pesoConciliado = tipo === "conciliada" ? rel.peso_reportado : rel.peso_conciliado;
          
          residuosCargados.push({
            residuo_id: gen.residuo_id || null,
            categoria_id: resEsp?.categoria_id || null,
            peso: rel.peso_reportado, // Este es el peso reportado
            motivo: gen.motivo || "Bloqueado",
            motivo_otro: gen.motivo_otro || "",
            residuo_otro: gen.residuo_otro || "",
            generacion_residuo_id: gen.id,
            acta_generacion_residuo_id: rel.id,
            peso_conciliado: pesoConciliado || null,
          });
        }
      }

      setResiduos(residuosCargados);
      
      // Verificar si hay novedades en los residuos para actualizar el tipo
      if (tipo === "conciliada") {
        const relacionesCompletas = await Promise.all(
          relacionesDelActa.map(async (rel: any) => {
            const relacionCompleta = await apiRequest<any>(
              `/actas-generacion-residuo/${rel.id}/`,
              { method: "GET" }
            );
            return relacionCompleta;
          })
        );
        
        // Verificar si algún residuo tiene descripción_novedad
        const tieneNovedad = relacionesCompletas.some(
          (rel: any) => rel.descripcion_novedad && rel.descripcion_novedad.trim() !== ""
        );
        
        if (tieneNovedad) {
          setTipoActa("con_novedad");
        }
      }
    } catch (err: any) {
      console.error("Error cargando datos:", err);
      setError(`Error al cargar el acta: ${err.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener residuos filtrados por subárea
  const obtenerResiduosFiltrados = useMemo(() => {
    if (!subareaId) return [];
    
    const categoriasDeSubArea = todasLasCategorias.filter(
      (cat) => cat.subarea_id === subareaId
    );
    
    const categoriaIds = categoriasDeSubArea.map((cat) => cat.id);
    
    // También incluir categorías genéricas (sin subárea asignada)
    const categoriasGenericas = todasLasCategorias.filter(
      (cat) => cat.subarea_id === null || cat.subarea_id === undefined
    );
    
    const categoriaIdsGenericas = categoriasGenericas.map(cat => cat.id);
    
    // Combinar ambos conjuntos de categorías
    const todasCategoriaIds = [...categoriaIds, ...categoriaIdsGenericas];
    
    return todosLosResiduos.filter((res) => todasCategoriaIds.includes(res.categoria_id));
  }, [subareaId, todasLasCategorias, todosLosResiduos]);

  // Determinar si es almacenamiento basado en los residuos actuales
  const esAlmacenamiento = useMemo(() => {
    // Verificar si alguno de los residuos actuales pertenece a grupos que requieren motivo
    const tieneResiduosConMotivo = residuos.some(residuo => {
      if (!residuo.residuo_id) return false;
      
      const residuoEnCatalogo = todosLosResiduos.find(r => r.id === residuo.residuo_id);
      if (!residuoEnCatalogo?.nombre) return false;
      
      const nombreResiduo = residuoEnCatalogo.nombre.toLowerCase();
      return GRUPOS_RESIDUOS_CON_MOTIVO.some(grupo =>
        nombreResiduo.includes(grupo.toLowerCase())
      );
    });

    // Si tiene residuos que requieren motivo, entonces es almacenamiento
    // O también podríamos verificar el tipo de acta
    return tieneResiduosConMotivo || 
           tipoActa === "pendiente" || 
           tipoActa === "conciliada" || 
           tipoActa === "con_novedad";
  }, [residuos, todosLosResiduos, tipoActa]);

  // Función para manejar cambio de centro de costo
  const handleCentroCostoChange = (centroCostoId: number) => {
    setCentroCostoId(centroCostoId);
    
    const centroSeleccionado = centrosCosto.find(cc => cc.id === centroCostoId);
    if (centroSeleccionado?.subarea_id) {
      const nuevaSubareaId = centroSeleccionado.subarea_id;
      
      if (nuevaSubareaId !== subareaId && residuos.length > 0) {
        setPendingSubareaId(nuevaSubareaId);
        setShowAreaChangeModal(true);
        return;
      } else {
        setSubareaId(nuevaSubareaId);
      }
    }
  };

  // Función para confirmar cambio de área
  const handleConfirmAreaChange = () => {
    if (!pendingSubareaId) return;
    
    // Filtrar residuos que existen en la nueva área
    const nuevosResiduos = residuos.filter(residuo => {
      if (!residuo.residuo_id) return false;
      
      const residuoEnCatalogo = todosLosResiduos.find(r => r.id === residuo.residuo_id);
      if (!residuoEnCatalogo) return false;
      
      const categoria = todasLasCategorias.find(c => c.id === residuoEnCatalogo.categoria_id);
      return categoria && (
        categoria.subarea_id === pendingSubareaId || 
        categoria.subarea_id === null || 
        categoria.subarea_id === undefined
      );
    });
    
    setResiduos(nuevosResiduos);
    setSubareaId(pendingSubareaId);
    setShowAreaChangeModal(false);
    setPendingSubareaId(null);
  };

  // Función para cancelar cambio de área
  const handleCancelAreaChange = () => {
    if (subareaId) {
      const centroAnterior = centrosCosto.find(cc => cc.subarea_id === subareaId);
      if (centroAnterior) {
        setCentroCostoId(centroAnterior.id);
      }
    }
    
    setShowAreaChangeModal(false);
    setPendingSubareaId(null);
  };

  // Función para eliminar un residuo
  const handleEliminarResiduo = (index: number) => {
    const residuo = residuos[index];
    
    if (residuo.acta_generacion_residuo_id) {
      setResiduosEliminados(prev => [...prev, residuo.acta_generacion_residuo_id!]);
    }
    
    setResiduos(prev => prev.filter((_, i) => i !== index));
  };

  // Función para agregar un nuevo residuo vacío
  const handleAgregarResiduo = () => {
    setResiduos(prev => [...prev, {
      residuo_id: null,
      categoria_id: null,
      motivo: '',
      motivo_otro: '',
      residuo_otro: '',
      peso: '',
      generacion_residuo_id: null,
      acta_generacion_residuo_id: null,
      peso_conciliado: estaConciliada ? '' : null // Para actas conciliadas, inicializar vacío
    }]);
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      setError("");

      if (!subareaId) {
        alert("Debes seleccionar una subárea");
        setSaving(false);
        return;
      }
      if (!centroCostoId) {
        alert("Debes seleccionar un centro de costo");
        setSaving(false);
        return;
      }
      if (residuos.length === 0) {
        alert("Debes tener al menos un residuo");
        setSaving(false);
        return;
      }

      // Validaciones
      for (const residuo of residuos) {
        if (!residuo.peso || parseFloat(residuo.peso) <= 0) {
          alert("Todos los residuos deben tener un peso mayor a 0");
          setSaving(false);
          return;
        }
        if (residuo.motivo === "Otro" && !residuo.motivo_otro?.trim()) {
          alert("Debes especificar el motivo cuando seleccionas 'Otro'");
          setSaving(false);
          return;
        }
        if (!residuo.residuo_id) {
          alert("Todos los residuos deben tener un tipo seleccionado");
          setSaving(false);
          return;
        }
      }

      // 1. Actualizar el acta - IMPORTANTE: Mantener documento_recepcion si existe
      await apiRequest(`/actas/${id}/`, {
        method: "PUT",
        body: {
          numero_acta: numeroActa,
          fecha_acta: fechaActa,
          subarea_id: subareaId,
          centro_costo_id: centroCostoId,
          documento_entrega: operarioDocumentoEntrega,
          documento_recepcion: operarioDocumentoRecepcion, // Mantener si ya existe
          consecutivo: consecutivo ? parseInt(consecutivo) : null,
          numero_inventario: numeroInventario ? parseInt(numeroInventario) : null,
        },
      });

      // 2. Eliminar residuos marcados
      for (const idRelacion of residuosEliminados) {
        try {
          const relacion = await apiRequest<any>(
            `/actas-generacion-residuo/${idRelacion}/`,
            { method: "GET" }
          );

          await apiRequest(`/actas-generacion-residuo/${idRelacion}/`, {
            method: "DELETE",
          });

          if (relacion.generacion_residuo_id) {
            await apiRequest(
              `/generacion-residuo/${relacion.generacion_residuo_id}/`,
              { method: "DELETE" }
            );
          }
        } catch (err) {
          console.warn("Error eliminando residuo:", err);
        }
      }

      // 3. Procesar residuos
      for (const residuo of residuos) {
        const residuoData = {
          fecha: fechaActa,
          peso: residuo.peso,
          residuo_id: residuo.residuo_id,
          operario_id: operarioId,
          motivo: residuo.motivo,
          motivo_otro: residuo.motivo === "Otro" ? residuo.motivo_otro : null,
          residuo_otro: residuo.residuo_otro || null,
        };

        if (residuo.acta_generacion_residuo_id && residuo.generacion_residuo_id) {
          // ACTUALIZAR RESIDUO EXISTENTE
          await apiRequest(
            `/generacion-residuo/${residuo.generacion_residuo_id}/`,
            {
              method: "PUT",
              body: residuoData,
            }
          );

          // Para residuos existentes en actas conciliadas, el peso_conciliado es el mismo que peso_reportado
          const pesoConciliado = estaConciliada ? residuo.peso : residuo.peso_conciliado;
          
          await apiRequest(`/actas-generacion-residuo/${residuo.acta_generacion_residuo_id}/`, {
            method: "PUT",
            body: {
              acta_id: parseInt(id!),
              generacion_residuo_id: residuo.generacion_residuo_id,
              peso_reportado: residuo.peso,
              peso_conciliado: pesoConciliado || null,
            },
          });
        } else {
          // CREAR NUEVO RESIDUO
          const nuevaGeneracion = await apiRequest<{ id: number }>(
            "/generacion-residuo/",
            {
              method: "POST",
              body: residuoData,
            }
          );

          // Para actas conciliadas, el peso_conciliado es el mismo que peso_reportado
          // Para actas pendientes, el peso_conciliado es null
          const pesoConciliado = estaConciliada ? residuo.peso : null;
          
          await apiRequest("/actas-generacion-residuo/", {
            method: "POST",
            body: {
              acta_id: parseInt(id!),
              generacion_residuo_id: nuevaGeneracion.id,
              peso_reportado: residuo.peso,
              peso_conciliado: pesoConciliado,
            },
          });
        }
      }

      alert("✓ Acta actualizada exitosamente");
      
      // Redirigir dependiendo del tipo de acta
      if (tipoActa === "pendiente") {
        navigate("/gestor-punto-verde/pendientes");
      } else {
        navigate("/gestor-punto-verde/conciliadas");
      }
      
    } catch (err: any) {
      console.error("Error guardando:", err);
      setError(`Error al guardar: ${err.message || "Error desconocido"}`);
      alert(`Error al guardar:\n${err.message || "Error desconocido"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelar = () => {
    if (confirm("¿Deseas descartar los cambios?")) {
      // Redirigir dependiendo del tipo de acta
      if (tipoActa === "pendiente") {
        navigate("/gestor-punto-verde/pendientes");
      } else {
        navigate("/gestor-punto-verde/conciliadas");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-skyBlue"></div>
      </div>
    );
  }

  // Encontrar la información de sede actual
  const subAreaActual = subareas.find(sa => sa.id === subareaId);
  const areaActual = areas.find(a => a.id === subAreaActual?.area_id);
  const procedenciaActual = procedencias.find(p => p.id === areaActual?.procedencia_id);
  const sedeActual = sedes.find(s => s.id === procedenciaActual?.sede_id);

  const estaConciliada = tipoActa === "conciliada" || tipoActa === "con_novedad";
  const estaConNovedad = tipoActa === "con_novedad";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue">
          Editar Acta {numeroActa}
        </h1>
        <button
          onClick={handleCancelar}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          ← Volver
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Modal para cambio de área */}
      {showAreaChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L4.206 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Cambio de Área Detectado
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Al cambiar de área, los residuos actuales podrían no estar disponibles en la nueva área.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg mb-6 text-left">
                <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">¿Qué deseas hacer?</p>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>✅ <span className="font-medium">Conservar:</span> Mantener solo los residuos disponibles en la nueva área</li>
                  <li>❌ <span className="font-medium">Cancelar:</span> Volver al área anterior</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCancelAreaChange}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium flex-1"
                >
                  Cancelar Cambio
                </button>
                <button
                  onClick={handleConfirmAreaChange}
                  className="px-5 py-2.5 bg-gradient-to-r from-skyBlue to-lightBlue text-white rounded-lg hover:from-skyBlue/90 hover:to-lightBlue/90 transition-all font-medium shadow-md hover:shadow-lg flex-1"
                >
                  Conservar Residuos Disponibles
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* Mostrar tipo actual */}
        {tipoActa && (
          <div className={`p-3 rounded mb-4 text-center font-bold ${
            estaConNovedad
              ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
              : tipoActa === "conciliada"
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              : tipoActa === "pendiente"
              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
              : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          }`}>
            Tipo: {estaConNovedad ? "CON NOVEDAD" : tipoActa.toUpperCase()}
            {estaConciliada && (
              <p className="text-sm mt-1">Nota: El peso ingresado será asignado tanto al peso reportado como al peso conciliado</p>
            )}
          </div>
        )}

        {/* Sección de Operarios */}
        <div>
          <h2 className="text-xl font-bold mb-4">👤 Operarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operario que registró el acta */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-3">
                Operario que registró el acta
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Documento</p>
                  <p className="font-semibold text-lg">{operarioDocumentoEntrega}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                  <p className="font-semibold">{operarioNombreEntrega || "No disponible"}</p>
                </div>
              </div>
            </div>

            {/* Operario que concilió el acta (solo si está conciliada) */}
            {estaConciliada ? (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-bold text-green-700 dark:text-green-300 mb-3">
                  Operario que concilió el acta
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Documento</p>
                    <p className="font-semibold text-lg">{operarioDocumentoRecepcion || "No disponible"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                    <p className="font-semibold">{operarioNombreRecepcion || "No disponible"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-bold text-yellow-700 dark:text-yellow-300 mb-3">
                  Estado del acta
                </h3>
                <div className="space-y-2">
                  <p className="text-yellow-600 dark:text-yellow-400">
                    Esta acta aún no ha sido conciliada.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Al conciliarse, aparecerá aquí el operario que realizó la conciliación.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información del Acta */}
        <div>
          <h2 className="text-xl font-bold mb-4">📋 Información del Acta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Número de Acta (Solo lectura)
              </label>
              <input
                type="text"
                value={numeroActa}
                disabled
                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Fecha (Solo lectura)
              </label>
              <input
                type="datetime-local"
                value={fechaActa.slice(0, 16)}
                disabled
                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Consecutivo
              </label>
              <input
                type="number"
                value={consecutivo}
                onChange={(e) => setConsecutivo(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700"
                placeholder="Opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Número de Inventario
              </label>
              <input
                type="number"
                value={numeroInventario}
                onChange={(e) => setNumeroInventario(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700"
                placeholder="Opcional"
              />
            </div>
          </div>
        </div>

        {/* Sección de Ubicación */}
        <SeccionUbicacion
          centroCostoId={centroCostoId}
          subAreaNombre={subAreaActual?.nombre || ""}
          areaNombre={areaActual?.nombre || ""}
          procedenciaNombre={procedenciaActual?.nombre || ""}
          sedeNombre={sedeActual?.nombre || ""}
          onCentroCostoChange={handleCentroCostoChange}
          centrosCosto={centrosCosto}
          subAreas={subareas}
          areas={areas}
          procedencias={procedencias}
          sedes={sedes}
          disabled={saving}
        />

        {/* Sección de Residuos - SOLO UN BOTÓN */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">♻️ Residuos ({residuos.length})</h2>
            <button
              type="button"
              onClick={handleAgregarResiduo}
              disabled={saving || !subareaId}
              className="px-4 py-2 bg-skyBlue hover:bg-lightBlue text-white rounded transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span>➕</span>
              Agregar Residuo
            </button>
          </div>

          {/* Contenedor con clase para ocultar el botón dentro de SeccionResiduos */}
          <div className="residuos-container">
            {residuos.map((residuo, index) => (
              <div key={index} className="border p-4 rounded-lg mb-4 relative">
                <div className="absolute -top-2 left-4 bg-skyBlue text-white px-3 py-1 rounded-full text-sm">
                  Residuo #{index + 1}
                </div>
                
                <button
                  onClick={() => handleEliminarResiduo(index)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition-colors"
                  title="Eliminar residuo"
                  disabled={saving || residuos.length <= 1}
                >
                  🗑️
                </button>
                
                {/* Mostrar información del peso */}
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {estaConciliada ? (
                      <>
                        💡 Para actas conciliadas, el peso ingresado se asignará tanto al <strong>peso reportado</strong> como al <strong>peso conciliado</strong>.
                      </>
                    ) : (
                      "💡 Este es el peso reportado del residuo."
                    )}
                  </p>
                </div>
                
                <SeccionResiduos
                  residuos={[{
                    residuo_id: residuo.residuo_id,
                    categoria_id: residuo.categoria_id,
                    motivo: residuo.motivo,
                    motivo_otro: residuo.motivo_otro,
                    residuo_otro: residuo.residuo_otro,
                    peso: residuo.peso
                  }]}
                  setResiduos={(nuevosResiduos) => {
                    const nuevos = [...residuos];
                    nuevos[index] = {
                      ...nuevosResiduos[0],
                      generacion_residuo_id: residuo.generacion_residuo_id,
                      acta_generacion_residuo_id: residuo.acta_generacion_residuo_id,
                      peso_conciliado: estaConciliada ? nuevosResiduos[0].peso : residuo.peso_conciliado // Para actas conciliadas, peso_conciliado = peso
                    };
                    setResiduos(nuevos);
                  }}
                  residuosDisponibles={obtenerResiduosFiltrados}
                  categoriasDisponibles={todasLasCategorias}
                  motivos={motivos}
                  onResiduoChange={() => {}}
                  onResiduoCampoChange={() => {}}
                  consecutivo={consecutivo}
                  numeroInventario={numeroInventario}
                  onConsecutivoChange={setConsecutivo}
                  onNumeroInventarioChange={setNumeroInventario}
                  areaId={subareaId}
                  esAlmacenamiento={esAlmacenamiento}
                  disabled={saving}
                  ocultarBotonAgregar={true}
                />
              </div>
            ))}
          </div>
          
          {residuos.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
              <p className="text-gray-500 mb-3">No hay residuos agregados</p>
              <button
                onClick={handleAgregarResiduo}
                disabled={saving || !subareaId}
                className="mt-2 px-4 py-2 bg-skyBlue hover:bg-lightBlue text-white rounded disabled:opacity-50"
              >
                ➕ Agregar Primer Residuo
              </button>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            onClick={handleCancelar}
            disabled={saving}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="px-5 py-2 bg-skyBlue hover:bg-lightBlue text-white rounded disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <span>💾</span>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}