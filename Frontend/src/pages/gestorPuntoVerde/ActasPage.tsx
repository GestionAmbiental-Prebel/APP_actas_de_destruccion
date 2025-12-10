import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TableResiduosActa from "../../components/common/TableResiduosActa";
import { obtenerActasCompletas } from "../../services/actas.service";
import { obtenerSubAreas } from "../../services/catalogo.service";
import { sortByDateDesc } from "../../utils/sortByDate";
import { exportToExcel } from "../../utils/exportExcel";
import { apiRequest } from "../../services/api.service";

export default function ActasPageGestorPV() {
  const [actas, setActas] = useState<any[]>([]);
  const [subareasMap, setSubareasMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingSubareas, setLoadingSubareas] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    cargarSubareas();
    cargarActas();
  }, []);

  const cargarSubareas = async () => {
    try {
      setLoadingSubareas(true);
      const data = await obtenerSubAreas();
      const map: Record<number, string> = {};
      data.forEach((s: any) => {
        if (s?.id != null) map[s.id] = s.nombre ?? `Subárea ${s.id}`;
      });
      setSubareasMap(map);
    } catch (err) {
      console.error("Error cargando subáreas:", err);
    } finally {
      setLoadingSubareas(false);
    }
  };

  const cargarActas = async () => {
    try {
      setLoading(true);
      const data = await obtenerActasCompletas();
      setActas(sortByDateDesc(data, "fecha_acta"));
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las actas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, numeroActa: string) => {
    const confirmacion = confirm(
      `¿Estás seguro de que deseas eliminar el Acta ${numeroActa}?\n\n` +
      `Esta acción eliminará:\n` +
      `• El acta y todos sus registros asociados\n` +
      `• Las relaciones con generaciones de residuos\n` +
      `• Las novedades de conciliación (si existen)\n\n` +
      `Esta acción NO se puede deshacer.`
    );
    
    if (!confirmacion) return;

    try {
      setDeleting(id);
      setError("");

      // 1. Obtener las relaciones acta-generacion-residuo
      const relaciones = await apiRequest<any[]>(
        `/actas-generacion-residuo/`,
        { method: "GET" }
      );

      const relacionesDelActa = relaciones.filter(
        (rel: any) => rel.acta_id === id
      );

      // 2. Eliminar novedades de conciliación asociadas
      for (const rel of relacionesDelActa) {
        try {
          // Obtener novedades de esta relación
          const novedades = await apiRequest<any[]>(
            `/novedad-conciliacion/`,
            { method: "GET" }
          );

          const novedadesDelResiduo = novedades.filter(
            (n: any) => n.acta_generacion_residuo_id === rel.id
          );

          // Eliminar cada novedad
          for (const novedad of novedadesDelResiduo) {
            await apiRequest(`/novedad-conciliacion/${novedad.id}/`, {
              method: "DELETE",
            });
          }
        } catch (err) {
          console.warn("Error eliminando novedades:", err);
        }
      }

      // 3. Eliminar relaciones acta-generacion-residuo
      for (const rel of relacionesDelActa) {
        await apiRequest(`/actas-generacion-residuo/${rel.id}/`, {
          method: "DELETE",
        });
      }

      // 4. Eliminar generaciones de residuo asociadas
      for (const rel of relacionesDelActa) {
        try {
          await apiRequest(`/generacion-residuo/${rel.generacion_residuo_id}/`, {
            method: "DELETE",
          });
        } catch (err) {
          console.warn("Error eliminando generación de residuo:", err);
        }
      }

      // 5. Finalmente, eliminar el acta
      await apiRequest(`/actas/${id}/`, {
        method: "DELETE",
      });

      // 6. Actualizar el estado local
      setActas((prev) => prev.filter((a) => a.id !== id));

      // Mostrar mensaje de éxito
      alert(`✓ Acta ${numeroActa} eliminada exitosamente`);

    } catch (err: any) {
      console.error("Error eliminando acta:", err);
      setError(
        `Error al eliminar el acta: ${err.message || "Error desconocido"}`
      );
      alert(
        `Error al eliminar el acta:\n${err.message || "Error desconocido"}`
      );
    } finally {
      setDeleting(null);
    }
  };

  const actasFiltradas = actas.filter((acta) => {
    const matchBusqueda =
      acta.numero_acta.toLowerCase().includes(busqueda.toLowerCase()) ||
      acta.operario_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      acta.residuos.some((r: any) =>
        r.residuo_nombre.toLowerCase().includes(busqueda.toLowerCase())
      );

    const fechaActa = new Date(acta.fecha_acta).getTime();
    const fechaDesde = desde ? new Date(desde).getTime() : null;
    const fechaHasta = hasta ? new Date(hasta).getTime() : null;

    return (
      matchBusqueda &&
      (!fechaDesde || fechaActa >= fechaDesde) &&
      (!fechaHasta || fechaActa <= fechaHasta)
    );
  });

  const handleExport = () => {
    const excelData = actasFiltradas.map((a) => {
      const pesoTotal = a.residuos.reduce(
        (t: number, r: any) => t + parseFloat(r.peso_reportado || "0"),
        0
      );

      return {
        "ID Acta": a.id,
        "Número Acta": a.numero_acta,
        Operario: a.operario_nombre,
        "Documento Operario": a.operario_documento,
        "Fecha Acta": a.fecha_acta,
        "Cantidad Residuos": a.residuos.length,
        "Peso Total (kg)": pesoTotal.toFixed(2),
        Subárea: a.subarea ?? subareasMap[a.subarea_id] ?? "Sin subárea",
        "Centro de Costo": a.centro_costo_codigo,
        "Estado": a.estado_conciliacion,
      };
    });

    exportToExcel(excelData, "Actas_PuntoVerde_Gestor");
  };

  const renderSubarea = (acta: any) => {
    if (acta.subarea && acta.subarea.trim() !== "") return acta.subarea;
    if (acta.subarea_id && subareasMap[acta.subarea_id])
      return subareasMap[acta.subarea_id];
    return "Sin subárea";
  };

  const renderEstadoBadge = (estado: string) => {
    const estados = {
      sin_conciliar: {
        label: "Sin conciliar",
        class: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      },
      conciliada: {
        label: "✓ Conciliada",
        class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      },
      con_novedad: {
        label: "⚠️ Con novedad",
        class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      },
      parcial: {
        label: "◐ Conciliación parcial",
        class: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      }
    };

    const config = estados[estado as keyof typeof estados] || estados.sin_conciliar;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-skyBlue dark:text-lightBlue">
        Actas Punto Verde – Gestor
      </h1>

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar por residuo / acta / operario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-2 border rounded flex-1 dark:bg-gray-800 dark:text-white"
        />

        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white"
        />

        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white"
        />

        <Link
          to="/gestor-pv/actas/nueva"
          className="px-4 py-2 bg-skyBlue text-white rounded hover:bg-sky-600 transition"
        >
          Crear Acta
        </Link>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Exportar Excel
        </button>
      </div>

      {/* ERRORES */}
      {error && (
        <div className="bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded mb-4">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-skyBlue"></div>
        </div>
      ) : actasFiltradas.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-300 mt-10">
          No hay actas que coincidan con los filtros.
        </div>
      ) : (
        <div className="space-y-6">
          {actasFiltradas.map((acta) => {
            const pesoTotal = acta.residuos.reduce(
              (total: number, r: any) =>
                total + (parseFloat(r.peso_reportado) || 0),
              0
            );

            const pesoConciliado = acta.residuos.reduce(
              (total: number, r: any) =>
                total + (parseFloat(r.peso_conciliado) || 0),
              0
            );

            const isDeleting = deleting === acta.id;

            return (
              <div
                key={acta.id}
                className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition ${
                  isDeleting ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                        {acta.numero_acta}
                      </h2>
                      {renderEstadoBadge(acta.estado_conciliacion)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                    <div className="bg-skyBlue/10 px-4 py-2 rounded-lg dark:bg-lightBlue/10">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Residuos
                      </p>
                      <p className="text-2xl font-bold text-skyBlue dark:text-lightBlue">
                        {acta.residuos.length}
                      </p>
                    </div>

                    {acta.tiene_conciliacion && (
                      <div className="bg-green-50 px-4 py-2 rounded-lg dark:bg-green-900/20">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Peso Conciliado
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {pesoConciliado.toFixed(2)} kg
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Datos principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm text-gray-700 dark:text-gray-300">
                  {acta.consecutivo && (
                    <p>
                      <strong>Consecutivo:</strong> {acta.consecutivo}
                    </p>
                  )}

                  {acta.numero_inventario && (
                    <p>
                      <strong>Número Inventario:</strong>{" "}
                      {acta.numero_inventario}
                    </p>
                  )}

                  <p>
                    <strong>Subárea:</strong> {renderSubarea(acta)}
                  </p>

                  {acta.centro_costo_codigo && (
                    <p>
                      <strong>Centro Costo:</strong> {acta.centro_costo_codigo}
                    </p>
                  )}
                </div>

                {/* Operario */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">👤 Operario</h3>

                  <div className="grid grid-cols-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">Cédula</p>
                      <p className="font-semibold">
                        {acta.operario_documento}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Nombre</p>
                      <p className="font-semibold">{acta.operario_nombre}</p>
                    </div>
                  </div>
                </div>

                {/* Novedades */}
                {acta.tiene_novedad && acta.residuos.some((r: any) => r.novedad) && (
                  <div className="mb-6 bg-yellow-100 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 p-4 rounded-lg">
                    <h3 className="font-bold mb-2">⚠️ Novedades:</h3>
                    {acta.residuos
                      .filter((r: any) => r.novedad)
                      .map((r: any, idx: number) => (
                        <p key={idx} className="text-sm">
                          • {r.residuo_nombre}: {r.novedad}
                        </p>
                      ))}
                  </div>
                )}

                {/* Residuos */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3 flex justify-between">
                    <span>♻️ Residuos Reportados</span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-200">
                      Peso Total: {pesoTotal.toFixed(2)} kg
                    </span>
                  </h3>

                  <TableResiduosActa
                    residuos={acta.residuos.map((r: any) => ({
                      residuo_nombre: r.residuo_nombre === "Otro"
                        ? `Otro – ${r.residuo_otro ?? ""}`
                        : r.residuo_nombre,
                      motivo: r.motivo === "Otro"
                        ? `Otro – ${r.motivo_otro ?? ""}`
                        : r.motivo,
                      descripcion_residuo_otro: r.residuo_otro,
                      descripcion_motivo_otro: r.motivo_otro,
                      peso_reportado: r.peso_reportado,
                      peso_conciliado: r.peso_conciliado,
                    }))}
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() =>
                      navigate(`/gestor-punto-verde/actas/editar/${acta.id}`)
                    }
                    disabled={isDeleting}
                    className="px-4 py-2 bg-skyBlue text-white rounded hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={() => handleDelete(acta.id, acta.numero_acta)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        🗑️ Eliminar
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}