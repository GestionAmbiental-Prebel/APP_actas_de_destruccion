import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Button from '../../components/common/Button';
import SeccionIdentificacion from '../../components/form/SeccionIdentificacion';
import SeccionUbicacion from '../../components/form/SeccionUbicacion';
import SeccionResiduos, { Residuo } from '../../components/form/SeccionResiduos';
import { apiRequest } from '../../services/api.service';
import {
  obtenerSubAreas,
  obtenerCentrosCosto,
  obtenerResiduosEspecificos,
  obtenerCategoriasResiduos,
  obtenerAreas,
  obtenerProcedencias,
  obtenerSedes,
} from '../../services/catalogo.service';
import { obtenerOperarios } from '../../services/operarios.service';
import { normalizarNombre } from '../../utils/normalizarNombre';

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

export default function EditActaPageGestorAmbiental() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Datos del acta
  const [numeroActa, setNumeroActa] = useState("");
  const [fechaActa, setFechaActa] = useState("");
  const [consecutivo, setConsecutivo] = useState("");
  const [numeroInventario, setNumeroInventario] = useState("");
  const [subareaId, setSubareaId] = useState<number | null>(null);
  const [centroCostoId, setCentroCostoId] = useState<number | null>(null);
  
  // Operarios
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
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
      setCedula(acta.documento_entrega || "");
      
      // Operario que concilió el acta
      setOperarioDocumentoRecepcion(acta.documento_recepcion || "");

      // Buscar operario que registró el acta
      const operarioEntrega = operariosData.find(
        (o: any) => o.documento === acta.documento_entrega
      );
      if (operarioEntrega) {
        setNombre(operarioEntrega.nombre || "");
        setApellido(operarioEntrega.apellido || "");
        setOperarioId(operarioEntrega.id);
      }

      // Buscar operario que concilió el acta
      if (acta.documento_recepcion) {
        const operarioRecepcion = operariosData.find(
          (o: any) => o.documento === acta.documento_recepcion
        );
        if (operarioRecepcion) {
          setOperarioNombreRecepcion(`${operarioRecepcion.nombre} ${operarioRecepcion.apellido || ""}`.trim());
        }
      }

      // Cargar residuos del acta
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
          
          // TODAS las actas aquí están conciliadas, así que usamos el peso reportado para ambos
          residuosCargados.push({
            residuo_id: gen.residuo_id || null,
            categoria_id: resEsp?.categoria_id || null,
            peso: rel.peso_reportado || gen.peso || "",
            motivo: gen.motivo || "Bloqueado",
            motivo_otro: gen.motivo_otro || "",
            residuo_otro: gen.residuo_otro || "",
            generacion_residuo_id: gen.id,
            acta_generacion_residuo_id: rel.id,
            peso_conciliado: rel.peso_reportado || rel.peso_conciliado || gen.peso || "", // Usar peso reportado como conciliado
          });
        }
      }

      setResiduos(residuosCargados);
      
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

    return tieneResiduosConMotivo;
  }, [residuos, todosLosResiduos]);

  // Función para manejar cambio de centro de costo
  const handleCentroCostoChange = (centroCostoId: number) => {
    setCentroCostoId(centroCostoId);
    
    const centroSeleccionado = centrosCosto.find(cc => cc.id === centroCostoId);
    if (centroSeleccionado?.subarea_id) {
      setSubareaId(centroSeleccionado.subarea_id);
    }
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
    // TODAS las actas aquí están conciliadas, así que inicializamos peso_conciliado vacío
    setResiduos(prev => [...prev, {
      residuo_id: null,
      categoria_id: null,
      motivo: '',
      motivo_otro: '',
      residuo_otro: '',
      peso: '',
      generacion_residuo_id: null,
      acta_generacion_residuo_id: null,
      peso_conciliado: '' // Inicializar vacío para actas conciliadas
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

      // 1. Actualizar el acta - MANTENER el documento_recepcion ya que todas están conciliadas
      await apiRequest(`/actas/${id}/`, {
        method: "PUT",
        body: {
          numero_acta: numeroActa,
          fecha_acta: fechaActa,
          subarea_id: subareaId,
          centro_costo_id: centroCostoId,
          documento_entrega: cedula,
          documento_recepcion: operarioDocumentoRecepcion, // Mantener la conciliación
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

      // 3. Procesar residuos - TODAS LAS ACTAS ESTÁN CONCILIADAS, así que peso_conciliado = peso
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

          // Para actas conciliadas, peso_conciliado = peso_reportado
          await apiRequest(`/actas-generacion-residuo/${residuo.acta_generacion_residuo_id}/`, {
            method: "PUT",
            body: {
              acta_id: parseInt(id!),
              generacion_residuo_id: residuo.generacion_residuo_id,
              peso_reportado: residuo.peso,
              peso_conciliado: residuo.peso, // Mismo peso para ambos campos
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

          // Para nuevas actas conciliadas, peso_conciliado = peso_reportado
          await apiRequest("/actas-generacion-residuo/", {
            method: "POST",
            body: {
              acta_id: parseInt(id!),
              generacion_residuo_id: nuevaGeneracion.id,
              peso_reportado: residuo.peso,
              peso_conciliado: residuo.peso, // Mismo peso para ambos campos
            },
          });
        }
      }

      alert("✓ Acta actualizada exitosamente");
      navigate("/gestor-ambiental");
      
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
      navigate("/gestor-ambiental");
    }
  };

  // Función para buscar operario por cédula
  const handleCedulaBlur = () => {
    if (cedula.length >= 6) {
      const operarioEncontrado = operarios.find(op => op.documento === cedula);
      if (operarioEncontrado) {
        setNombre(operarioEncontrado.nombre || '');
        setApellido(operarioEncontrado.apellido || '');
        setOperarioId(operarioEncontrado.id);
        
        // Si tiene subárea asignada, actualizar ubicación
        if (operarioEncontrado.subarea_id) {
          setSubareaId(operarioEncontrado.subarea_id);
          const subArea = subareas.find(sa => sa.id === operarioEncontrado.subarea_id);
          if (subArea) {
            // Buscar centro de costo asociado a esta subárea
            const centroCosto = centrosCosto.find(cc => cc.subarea_id === subArea.id);
            if (centroCosto) {
              setCentroCostoId(centroCosto.id);
            }
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-skyBlue mx-auto mb-4"></div>
          <p className="text-xl">Cargando acta #{id}...</p>
        </div>
      </div>
    );
  }

  // Encontrar la información de sede actual
  const subAreaActual = subareas.find(sa => sa.id === subareaId);
  const areaActual = areas.find(a => a.id === subAreaActual?.area_id);
  const procedenciaActual = procedencias.find(p => p.id === areaActual?.procedencia_id);
  const sedeActual = sedes.find(s => s.id === procedenciaActual?.sede_id);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue">
            Editar Acta {numeroActa}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestor Ambiental - Modo edición (Acta Conciliada)
          </p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleCancelar}
          className="flex items-center gap-2"
          disabled={saving}
        >
          <span>←</span>
          Volver
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
        {/* Estado del Acta */}
        <div className="p-3 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-center font-bold">
          ✅ ACTA CONCILIADA
          <p className="text-sm mt-1">El peso ingresado se asignará tanto al peso reportado como al peso conciliado</p>
        </div>

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
                  <p className="font-semibold text-lg">{cedula}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                  <p className="font-semibold">{nombre} {apellido}</p>
                </div>
              </div>
            </div>

            {/* Operario que concilió el acta */}
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
                disabled={saving}
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
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Sección de Identificación */}
        <SeccionIdentificacion
          cedula={cedula}
          setCedula={setCedula}
          nombre={nombre}
          setNombre={setNombre}
          apellido={apellido}
          setApellido={setApellido}
          onCedulaBlur={handleCedulaBlur}
         
        />

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

        {/* Sección de Residuos */}
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
                
                {/* Información sobre peso para actas conciliadas */}
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    💡 Para actas conciliadas, el peso ingresado se asignará tanto al <strong>peso reportado</strong> como al <strong>peso conciliado</strong>.
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
                      peso_conciliado: nuevosResiduos[0].peso // Para actas conciliadas, peso_conciliado = peso
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

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="secondary" 
            onClick={handleCancelar}
            className="px-6 py-3"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleGuardar}
            className="px-6 py-3"
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Guardando...
              </span>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}