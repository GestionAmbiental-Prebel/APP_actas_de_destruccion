import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../../services/api.service";
import {
  obtenerSubAreas,
  obtenerCentrosCosto,
  obtenerResiduosEspecificos,
  obtenerCategoriasResiduos,
} from "../../services/catalogo.service";
import { obtenerOperarios } from "../../services/operarios.service";

type Residuo = {
  id: number | null;
  generacion_residuo_id: number | null;
  residuo_id: number;
  residuo_nombre: string;
  peso_reportado: string;
  motivo: string;
  motivo_otro?: string;
  residuo_otro?: string;
  operario_id: number;
  esNuevo?: boolean;
  peso_conciliado?: string | null; // Agregado
};

export default function EditarActaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [estadoActual, setEstadoActual] = useState<string>(""); // Nuevo estado

  // Datos del acta
  const [numeroActa, setNumeroActa] = useState("");
  const [fechaActa, setFechaActa] = useState("");
  const [consecutivo, setConsecutivo] = useState("");
  const [numeroInventario, setNumeroInventario] = useState("");
  const [subareaId, setSubareaId] = useState<number | null>(null);
  const [centroCostoId, setCentroCostoId] = useState<number | null>(null);
  const [operarioDocumento, setOperarioDocumento] = useState("");
  const [operarioNombre, setOperarioNombre] = useState("");
  const [operarioId, setOperarioId] = useState<number>(0);
  const [documentoRecepcion, setDocumentoRecepcion] = useState(""); // Agregado

  // Residuos
  const [residuos, setResiduos] = useState<Residuo[]>([]);
  const [residuosEliminados, setResiduosEliminados] = useState<number[]>([]);

  // Catálogos
  const [subareas, setSubareas] = useState<any[]>([]);
  const [centrosCosto, setCentrosCosto] = useState<any[]>([]);
  const [todosLosResiduos, setTodosLosResiduos] = useState<any[]>([]);
  const [todasLasCategorias, setTodasLasCategorias] = useState<any[]>([]);

  // Motivos (igual que en el formulario de creación)
  const motivos = ['Bloqueado', 'Obsoleto', 'Rechazado', 'Vencido', 'Otro'];

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      // Cargar catálogos
      const [subAreasData, centrosCostoData, residuosData, categoriasData, operariosData] =
        await Promise.all([
          obtenerSubAreas(),
          obtenerCentrosCosto(),
          obtenerResiduosEspecificos(),
          obtenerCategoriasResiduos(),
          obtenerOperarios(),
        ]);

      setSubareas(subAreasData);
      setCentrosCosto(centrosCostoData);
      setTodosLosResiduos(residuosData);
      setTodasLasCategorias(categoriasData);

      // Cargar el acta
      const acta = await apiRequest<any>(`/actas/${id}/`, { method: "GET" });

      setNumeroActa(acta.numero_acta);
      setFechaActa(acta.fecha_acta);
      setConsecutivo(acta.consecutivo || "");
      setNumeroInventario(acta.numero_inventario || "");
      setSubareaId(acta.subarea_id);
      setCentroCostoId(acta.centro_costo_id);
      setOperarioDocumento(acta.documento_entrega);
      setDocumentoRecepcion(acta.documento_recepcion || ""); // Guardar documento recepción
      setEstadoActual(acta.estado || ""); // Guardar estado actual

      // Buscar operario
      const operario = operariosData.find(
        (o: any) => o.documento === acta.documento_entrega
      );
      if (operario) {
        setOperarioNombre(`${operario.nombre} ${operario.apellido || ""}`.trim());
        setOperarioId(operario.id);
      }

      // Cargar residuos del acta con sus pesos conciliados
      const relaciones = await apiRequest<any[]>("/actas-generacion-residuo/", {
        method: "GET",
      });
      const relacionesDelActa = relaciones.filter(
        (r: any) => r.acta_id === parseInt(id!)
      );

      const generaciones = await apiRequest<any[]>("/generacion-residuo/", {
        method: "GET",
      });

      const residuosCargados: Residuo[] = relacionesDelActa.map((rel: any) => {
        const gen = generaciones.find(
          (g: any) => g.id === rel.generacion_residuo_id
        );
        const resEsp = residuosData.find((r: any) => r.id === gen?.residuo_id);

        return {
          id: rel.id,
          generacion_residuo_id: rel.generacion_residuo_id,
          residuo_id: gen?.residuo_id || 0,
          residuo_nombre: resEsp?.nombre || "Sin nombre",
          peso_reportado: rel.peso_reportado,
          peso_conciliado: rel.peso_conciliado, // Guardar peso conciliado
          motivo: gen?.motivo || "Bloqueado",
          motivo_otro: gen?.motivo_otro || "",
          residuo_otro: gen?.residuo_otro || "",
          operario_id: gen?.operario_id || operario?.id || 0,
          esNuevo: false,
        };
      });

      setResiduos(residuosCargados);
    } catch (err: any) {
      console.error("Error cargando datos:", err);
      setError(`Error al cargar el acta: ${err.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener residuos filtrados por subárea
  const obtenerResiduosFiltrados = () => {
    if (!subareaId) return [];
    
    const categoriasDeSubArea = todasLasCategorias.filter(
      (cat) => cat.subarea_id === subareaId
    );
    
    const categoriaIds = categoriasDeSubArea.map((cat) => cat.id);
    
    return todosLosResiduos.filter((res) => categoriaIds.includes(res.categoria_id));
  };

  // Manejar cambio de centro de costo (autocompletar subárea)
  const handleCentroCostoChange = (centroCostoId: number) => {
    setCentroCostoId(centroCostoId);
    
    const centro = centrosCosto.find(cc => cc.id === centroCostoId);
    if (centro && centro.subarea_id) {
      setSubareaId(centro.subarea_id);
    }
  };

  const agregarResiduo = () => {
    const residuosDisponibles = obtenerResiduosFiltrados();

    if (residuosDisponibles.length === 0) {
      alert("No hay residuos disponibles para esta subárea");
      return;
    }

    const nuevoResiduo: Residuo = {
      id: null,
      generacion_residuo_id: null,
      residuo_id: residuosDisponibles[0].id,
      residuo_nombre: residuosDisponibles[0].nombre,
      peso_reportado: "0",
      peso_conciliado: null, // Nuevo residuo no conciliado
      motivo: "Bloqueado",
      motivo_otro: "",
      residuo_otro: "",
      operario_id: operarioId,
      esNuevo: true,
    };

    setResiduos([...residuos, nuevoResiduo]);
  };

  const eliminarResiduo = (index: number) => {
    const residuo = residuos[index];

    if (!residuo.esNuevo && residuo.id) {
      setResiduosEliminados([...residuosEliminados, residuo.id]);
    }

    setResiduos(residuos.filter((_, i) => i !== index));
  };

  const handleCambioResiduo = (index: number, campo: string, valor: any) => {
    const nuevosResiduos = [...residuos];
    
    if (campo === "residuo_id") {
      const residuoSeleccionado = todosLosResiduos.find(
        (r) => r.id === parseInt(valor)
      );
      nuevosResiduos[index].residuo_id = parseInt(valor);
      nuevosResiduos[index].residuo_nombre = residuoSeleccionado?.nombre || "";
    } else {
      (nuevosResiduos[index] as any)[campo] = valor;
    }

    setResiduos(nuevosResiduos);
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
        if (!residuo.peso_reportado || parseFloat(residuo.peso_reportado) <= 0) {
          alert("Todos los residuos deben tener un peso mayor a 0");
          setSaving(false);
          return;
        }
        if (residuo.motivo === "Otro" && !residuo.motivo_otro?.trim()) {
          alert("Debes especificar el motivo cuando seleccionas 'Otro'");
          setSaving(false);
          return;
        }
      }

      // 1. Actualizar el acta MANTENIENDO EL ESTADO
      await apiRequest(`/actas/${id}/`, {
        method: "PUT",
        body: {
          numero_acta: numeroActa,
          fecha_acta: fechaActa,
          subarea_id: subareaId,
          centro_costo_id: centroCostoId,
          documento_entrega: operarioDocumento,
          documento_recepcion: documentoRecepcion, // Mantener documento recepción
          consecutivo: consecutivo ? parseInt(consecutivo) : null,
          numero_inventario: numeroInventario ? parseInt(numeroInventario) : null,
          estado: estadoActual, // Mantener el estado actual
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

          // Eliminar la generación de residuo asociada
          if (relacion.generacion_residuo_id) {
            await apiRequest(
              `/generacion-residuo/${relacion.generacion_residuo_id}/`,
              { method: "DELETE" }
            );
          }
        } catch (err) {
          console.warn("Error eliminando residuo:", err);
          // Continuar aunque falle uno
        }
      }

      // 3. Procesar residuos (nuevos y existentes)
      for (const residuo of residuos) {
        if (residuo.esNuevo) {
          // CREAR NUEVO RESIDUO
          const nuevaGeneracion = await apiRequest<{ id: number }>(
            "/generacion-residuo/",
            {
              method: "POST",
              body: {
                fecha: fechaActa,
                peso: residuo.peso_reportado,
                residuo_id: residuo.residuo_id,
                operario_id: residuo.operario_id,
                motivo: residuo.motivo,
                motivo_otro:
                  residuo.motivo === "Otro" ? residuo.motivo_otro : null,
                residuo_otro: residuo.residuo_otro || null,
              },
            }
          );

          await apiRequest("/actas-generacion-residuo/", {
            method: "POST",
            body: {
              acta_id: parseInt(id!),
              generacion_residuo_id: nuevaGeneracion.id,
              peso_reportado: residuo.peso_reportado,
              peso_conciliado: null, // Nuevo residuo no conciliado
            },
          });
        } else {
          // IMPORTANTE: Obtener la relación actual para preservar peso_conciliado
          let pesoConciliadoActual = null;
          if (residuo.id) {
            try {
              const relacionActual = await apiRequest<any>(
                `/actas-generacion-residuo/${residuo.id}/`,
                { method: "GET" }
              );
              pesoConciliadoActual = relacionActual.peso_conciliado;
            } catch (err) {
              console.warn("No se pudo obtener relación actual:", err);
            }
          }

          // ACTUALIZAR RESIDUO EXISTENTE - PRESERVAR PESO CONCILIADO
          if (residuo.id) {
            await apiRequest(`/actas-generacion-residuo/${residuo.id}/`, {
              method: "PUT",
              body: {
                acta_id: parseInt(id!),
                generacion_residuo_id: residuo.generacion_residuo_id,
                peso_reportado: residuo.peso_reportado,
                peso_conciliado: pesoConciliadoActual, // ¡MANTENER peso_conciliado!
              },
            });
          }

          // Actualizar generación de residuo
          if (residuo.generacion_residuo_id) {
            const generacion = await apiRequest<any>(
              `/generacion-residuo/${residuo.generacion_residuo_id}/`,
              { method: "GET" }
            );

            await apiRequest(
              `/generacion-residuo/${residuo.generacion_residuo_id}/`,
              {
                method: "PUT",
                body: {
                  ...generacion,
                  residuo_id: residuo.residuo_id,
                  peso: residuo.peso_reportado,
                  motivo: residuo.motivo,
                  motivo_otro:
                    residuo.motivo === "Otro" ? residuo.motivo_otro : null,
                  residuo_otro: residuo.residuo_otro || null,
                },
              }
            );
          }
        }
      }

      alert("✓ Acta actualizada exitosamente");
      // Redirigir correctamente a actas conciliadas
      navigate("/gestor-punto-verde/conciliadas");
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
      navigate("/gestor-punto-verde/conciliadas");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-skyBlue"></div>
      </div>
    );
  }

  const residuosDisponibles = obtenerResiduosFiltrados();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue">
          Editar Acta {numeroActa} - Estado: {estadoActual}
        </h1>
        <button
          onClick={handleCancelar}
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          ← Volver
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* Mostrar estado actual */}
        {estadoActual && (
          <div className={`p-3 rounded mb-4 text-center font-bold ${
            estadoActual === "conciliado" 
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              : estadoActual === "pendiente"
              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
              : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          }`}>
            Estado actual: {estadoActual.toUpperCase()}
          </div>
        )}

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

            <div>
              <label className="block text-sm font-semibold mb-2">
                Centro de Costo *
              </label>
              <select
                value={centroCostoId || ""}
                onChange={(e) => handleCentroCostoChange(parseInt(e.target.value))}
                className="w-full p-2 border rounded dark:bg-gray-700"
                required
              >
                <option value="">Seleccionar</option>
                {centrosCosto.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigo} - {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Subárea *
              </label>
              <select
                value={subareaId || ""}
                onChange={(e) => setSubareaId(parseInt(e.target.value))}
                className="w-full p-2 border rounded dark:bg-gray-700"
                required
              >
                <option value="">Seleccionar</option>
                {subareas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Se autocompletará al seleccionar un centro de costo
              </p>
            </div>
          </div>
        </div>

        {/* Operario */}
        <div>
          <h2 className="text-xl font-bold mb-4">👤 Operario</h2>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cédula</p>
            <p className="font-semibold">{operarioDocumento}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Nombre
            </p>
            <p className="font-semibold">{operarioNombre || "No disponible"}</p>
          </div>
        </div>

        {/* Residuos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">♻️ Residuos</h2>
            <button
              onClick={agregarResiduo}
              disabled={residuosDisponibles.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              + Agregar Residuo
            </button>
          </div>

          {residuosDisponibles.length === 0 && (
            <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-3 rounded mb-4">
              No hay residuos disponibles para esta subárea. Selecciona un centro de costo para ver los residuos disponibles.
            </div>
          )}

          {residuos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay residuos. Haz clic en "Agregar Residuo" para añadir uno.
            </div>
          ) : (
            <div className="space-y-4">
              {residuos.map((residuo, index) => (
                <div
                  key={index}
                  className="border dark:border-gray-600 rounded p-4 bg-gray-50 dark:bg-gray-700/30 relative"
                >
                  <button
                    onClick={() => eliminarResiduo(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl"
                    title="Eliminar residuo"
                  >
                    ×
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Residuo *
                      </label>
                      <select
                        value={residuo.residuo_id}
                        onChange={(e) =>
                          handleCambioResiduo(index, "residuo_id", e.target.value)
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700"
                      >
                        {residuosDisponibles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Peso Reportado (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={residuo.peso_reportado}
                        onChange={(e) =>
                          handleCambioResiduo(
                            index,
                            "peso_reportado",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Motivo *
                      </label>
                      <select
                        value={residuo.motivo}
                        onChange={(e) =>
                          handleCambioResiduo(index, "motivo", e.target.value)
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700"
                      >
                        {motivos.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    {residuo.motivo === "Otro" && (
                      <div className="md:col-span-3">
                        <label className="block text-sm font-semibold mb-2">
                          Especificar motivo *
                        </label>
                        <input
                          type="text"
                          value={residuo.motivo_otro || ""}
                          onChange={(e) =>
                            handleCambioResiduo(
                              index,
                              "motivo_otro",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded dark:bg-gray-700"
                          placeholder="Describe el motivo"
                          required
                        />
                      </div>
                    )}

                    {residuo.residuo_nombre === "Otro" && (
                      <div className="md:col-span-3">
                        <label className="block text-sm font-semibold mb-2">
                          Especificar residuo
                        </label>
                        <input
                          type="text"
                          value={residuo.residuo_otro || ""}
                          onChange={(e) =>
                            handleCambioResiduo(
                              index,
                              "residuo_otro",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded dark:bg-gray-700"
                          placeholder="Describe el residuo"
                        />
                      </div>
                    )}
                  </div>

                  {residuo.esNuevo && (
                    <div className="mt-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        Nuevo residuo
                      </span>
                    </div>
                  )}

                  {residuo.peso_conciliado && (
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Peso conciliado: {residuo.peso_conciliado} kg
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            onClick={handleCancelar}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="px-6 py-2 bg-skyBlue text-white rounded hover:bg-sky-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              "💾 Guardar Cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}