import { useState } from "react";
import { ConciliacionExtendida } from "../services/actasConciliadas.service";
import { apiRequest } from "../services/api.service";
import { ResiduoEditable } from "../types/actas.types";
import { obtenerResiduosFiltrados, validarSoloNumeros, validarMaximoDigitos } from "../utils/actaValidations";

type UseModalConciliarProps = {
  residuosEspecificos: any[];
  categoriasResiduos: any[];
  subareas: any[];
  centrosCosto: any[];
  operarios: any[];
  operariosPuntoVerde: any[];
  onSuccess: () => Promise<void>;
};

export const useModalConciliar = ({
  residuosEspecificos,
  categoriasResiduos,
  subareas,
  centrosCosto,
  operarios,
  operariosPuntoVerde,
  onSuccess,
}: UseModalConciliarProps) => {
  const [modalConciliarAbierto, setModalConciliarAbierto] = useState(false);
  const [actaConciliando, setActaConciliando] = useState<ConciliacionExtendida | null>(null);
  const [residuosEditables, setResiduosEditables] = useState<ResiduoEditable[]>([]);
  const [residuosFiltrados, setResiduosFiltrados] = useState<any[]>([]);
  const [guardando, setGuardando] = useState(false);

  const encontrarOperarioPorDocumento = (documento: string): number | null => {
    if (!documento) return null;
    const operario = operarios.find((op) => op.documento === documento);
    return operario ? operario.id : null;
  };

  const abrirModalResolverNovedad = async (acta: ConciliacionExtendida) => {
    setActaConciliando(acta);

    try {
      const relacionesCompletas = await apiRequest<any[]>("/actas-generacion-residuo/");

      const residuosEdit: ResiduoEditable[] = acta.residuos.map((r) => {
        const residuoEspecifico = residuosEspecificos.find(
          (res) =>
            res.nombre === r.residuo_nombre ||
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
        const filtrados = obtenerResiduosFiltrados(
          acta.subarea_id,
          categoriasResiduos,
          residuosEspecificos
        );
        setResiduosFiltrados(filtrados);
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

  // Handlers
  const handleCambioPesoConciliado = (index: number, valor: string) => {
    const nuevosResiduos = [...residuosEditables];
    nuevosResiduos[index].peso_conciliado = valor;
    setResiduosEditables(nuevosResiduos);
  };

  const handleCambioResiduo = (index: number, residuoId: number) => {
    const nuevosResiduos = [...residuosEditables];
    const residuoSeleccionado = residuosFiltrados.find((r) => r.id === residuoId);

    nuevosResiduos[index].residuo_id = residuoId;
    nuevosResiduos[index].residuo_nombre = residuoSeleccionado?.nombre || "";
    nuevosResiduos[index].categoria_id = residuoSeleccionado?.categoria_id || null;

    if (residuoSeleccionado?.nombre === "Otro") {
      nuevosResiduos[index].residuo_otro =
        nuevosResiduos[index].descripcion_residuo_otro || "";
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
      consecutivo: valor,
    } as ConciliacionExtendida);
  };

  const handleCambioNumeroInventario = (valor: string | null) => {
    if (!actaConciliando) return;
    setActaConciliando({
      ...actaConciliando,
      numero_inventario: valor,
    } as ConciliacionExtendida);
  };

  const handleCambioOperarioDocumento = (valor: string) => {
    if (!actaConciliando) return;
    setActaConciliando({
      ...actaConciliando,
      operario_documento: valor,
    });
  };

  const handleCambioConciliadorDocumento = (valor: string) => {
    if (!actaConciliando) return;
    setActaConciliando({
      ...actaConciliando,
      conciliador_documento: valor,
    });
  };

  const handleCambioConciliador = (
    conciliadorId: number | null,
    conciliadorDocumento?: string
  ) => {
    if (!actaConciliando) return;

    const actaActualizada = {
      ...actaConciliando,
      conciliador_documento: conciliadorDocumento || actaConciliando.conciliador_documento,
    };
    setActaConciliando(actaActualizada as ConciliacionExtendida);
  };

  const handleCambioSubarea = (subareaId: number | null) => {
    if (!actaConciliando) return;

    const actaActualizada = {
      ...actaConciliando,
      subarea_id: subareaId,
    };
    setActaConciliando(actaActualizada as ConciliacionExtendida);

    if (subareaId) {
      const nuevosResiduosFiltrados = obtenerResiduosFiltrados(
        subareaId,
        categoriasResiduos,
        residuosEspecificos
      );
      setResiduosFiltrados(nuevosResiduosFiltrados);
    } else {
      setResiduosFiltrados([]);
    }
  };

  const handleCambioCentroCosto = (centroCostoId: number | null) => {
    if (!actaConciliando) return;

    const actaActualizada = {
      ...actaConciliando,
      centro_costo_id: centroCostoId,
    };
    setActaConciliando(actaActualizada as ConciliacionExtendida);

    if (centroCostoId) {
      const centro = centrosCosto.find((cc) => cc.id === centroCostoId);
      if (centro && centro.subarea_id) {
        handleCambioSubarea(centro.subarea_id);

        const actaConSubarea = {
          ...actaActualizada,
          subarea_id: centro.subarea_id,
          subarea_nombre: subareas.find((s) => s.id === centro.subarea_id)?.nombre || "",
        };
        setActaConciliando(actaConSubarea as ConciliacionExtendida);
      }
    }
  };

  const handleCambioOperario = (operarioId: number | null, operarioDocumento?: string) => {
    if (!actaConciliando) return;

    const actaActualizada = {
      ...actaConciliando,
      operario_documento: operarioDocumento || actaConciliando.operario_documento,
    };
    setActaConciliando(actaActualizada as ConciliacionExtendida);
  };

  const handleAgregarResiduo = () => {
    if (!actaConciliando) return;

    // Validar que haya residuos disponibles para agregar
    if (residuosFiltrados.length === 0) {
      alert("No hay residuos disponibles para esta subárea. Por favor, selecciona una subárea primero.");
      return;
    }

    const nuevoResiduo: ResiduoEditable = {
      acta_generacion_residuo_id: 0, // ID 0 indica que es un residuo nuevo
      generacion_residuo_id: undefined, // No tiene generación aún
      residuo_id: residuosFiltrados[0].id,
      residuo_nombre: residuosFiltrados[0].nombre,
      categoria_id: residuosFiltrados[0].categoria_id,
      motivo: "Bloqueado",
      descripcion_residuo_otro: "",
      descripcion_motivo_otro: "",
      peso_reportado: "0",
      peso_conciliado: "0",
      motivo_otro: null,
      residuo_otro: null,
    };

    console.log("➕ Agregando nuevo residuo al acta:", {
      acta_id: actaConciliando.acta_id,
      numero_acta: actaConciliando.numero_acta,
      nuevo_residuo: nuevoResiduo
    });

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

    if (
      !nuevosResiduos[index].peso_conciliado ||
      nuevosResiduos[index].peso_conciliado === "0"
    ) {
      nuevosResiduos[index].peso_conciliado = valor;
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

  const handleGuardarConciliacion = async () => {
    if (!actaConciliando) return;

    try {
      setGuardando(true);

      console.log("🔄 Iniciando conciliación para acta:", actaConciliando.acta_id);
      console.log("📋 Residuos a procesar:", residuosEditables.length);

      // Validar pesos conciliados
      for (const residuo of residuosEditables) {
        if (!residuo.peso_conciliado || parseFloat(residuo.peso_conciliado) <= 0) {
          alert("Todos los residuos deben tener un peso conciliado mayor a 0");
          setGuardando(false);
          return;
        }
      }

      // Validar documentos
      const operarioDoc = actaConciliando.operario_documento?.toString() || "";
      if (!operarioDoc || !validarSoloNumeros(operarioDoc)) {
        alert("El documento del operario es requerido y solo debe contener números");
        setGuardando(false);
        return;
      }
      if (!validarMaximoDigitos(operarioDoc, 10)) {
        alert("El documento del operario no puede tener más de 10 dígitos");
        setGuardando(false);
        return;
      }

      const conciliadorDoc = actaConciliando.conciliador_documento?.toString() || "";
      if (!conciliadorDoc || !validarSoloNumeros(conciliadorDoc)) {
        alert("El documento del conciliador es requerido y solo debe contener números");
        setGuardando(false);
        return;
      }
      if (!validarMaximoDigitos(conciliadorDoc, 10)) {
        alert("El documento del conciliador no puede tener más de 10 dígitos");
        setGuardando(false);
        return;
      }

      // Validar que el conciliador sea de punto verde
      const conciliador = operariosPuntoVerde.find((op) => op.documento === conciliadorDoc);

      if (!conciliador) {
        alert(
          "❌ El documento del conciliador no corresponde a un operario de Punto Verde autorizado para conciliar"
        );
        setGuardando(false);
        return;
      }

      // Validar consecutivo e inventario
      if (!validarSoloNumeros(actaConciliando.consecutivo)) {
        alert("El consecutivo solo debe contener números");
        setGuardando(false);
        return;
      }
      if (!validarMaximoDigitos(actaConciliando.consecutivo, 6)) {
        alert("El consecutivo no puede tener más de 6 dígitos");
        setGuardando(false);
        return;
      }

      if (!validarSoloNumeros(actaConciliando.numero_inventario)) {
        alert("El número de inventario solo debe contener números");
        setGuardando(false);
        return;
      }
      if (!validarMaximoDigitos(actaConciliando.numero_inventario, 11)) {
        alert("El número de inventario no puede tener más de 11 dígitos");
        setGuardando(false);
        return;
      }

      // PASO 1: Actualizar el acta primero
      console.log("📝 PASO 1: Actualizando información del acta");
      const actaActualizada: any = {
        documento_entrega: actaConciliando.operario_documento,
        documento_recepcion: conciliadorDoc,
        fecha_conciliacion: new Date().toISOString(),
      };

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
          actaActualizada.consecutivo = !isNaN(consecutivoNum)
            ? consecutivoNum
            : consecutivoStr;
        } else {
          actaActualizada.consecutivo = null;
        }
      } else {
        actaActualizada.consecutivo = null;
      }

      // Manejar número de inventario
      if (
        actaConciliando.numero_inventario !== undefined &&
        actaConciliando.numero_inventario !== null
      ) {
        const inventarioStr = actaConciliando.numero_inventario.toString().trim();
        if (inventarioStr !== "") {
          const inventarioNum = parseInt(inventarioStr, 10);
          actaActualizada.numero_inventario = !isNaN(inventarioNum)
            ? inventarioNum
            : inventarioStr;
        } else {
          actaActualizada.numero_inventario = null;
        }
      } else {
        actaActualizada.numero_inventario = null;
      }

      await apiRequest(`/actas/${actaConciliando.acta_id}/`, {
        method: "PATCH",
        body: actaActualizada,
      });

      console.log("✅ Acta actualizada correctamente");

      // PASO 2: Procesar cada residuo
      console.log("📝 PASO 2: Procesando residuos");
      for (const [index, residuo] of residuosEditables.entries()) {
        console.log(`   Residuo ${index + 1}/${residuosEditables.length}:`, {
          id: residuo.acta_generacion_residuo_id,
          nombre: residuo.residuo_nombre,
          es_nuevo: residuo.acta_generacion_residuo_id === 0
        });

        if (residuo.acta_generacion_residuo_id === 0) {
          // RESIDUO NUEVO - Asociarlo al acta existente
          const operarioId = encontrarOperarioPorDocumento(
            actaConciliando.operario_documento || ""
          );

          if (!operarioId) {
            alert("No se pudo encontrar el operario. Verifica el documento del operario.");
            setGuardando(false);
            return;
          }

          // Validar que el residuo tenga datos válidos
          if (!residuo.residuo_id || residuo.residuo_id === 0) {
            alert("Debes seleccionar un residuo válido antes de guardar.");
            setGuardando(false);
            return;
          }

          if (!residuo.peso_reportado || parseFloat(residuo.peso_reportado) <= 0) {
            alert("El peso reportado debe ser mayor a 0 para todos los residuos.");
            setGuardando(false);
            return;
          }

          console.log("      📝 Creando nueva generación de residuo");

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

          console.log("      ✅ Generación creada con ID:", nuevaGeneracion.id);
          console.log("      📎 Asociando al acta EXISTENTE:", actaConciliando.acta_id);

          // IMPORTANTE: Asociar la nueva generación al ACTA EXISTENTE
          const relacionCreada = await apiRequest<{ id: number }>("/actas-generacion-residuo/", {
            method: "POST",
            body: {
              acta_id: actaConciliando.acta_id, // ID del acta actual (NO crear nueva)
              generacion_residuo_id: nuevaGeneracion.id,
              peso_reportado: parseFloat(residuo.peso_reportado),
              peso_conciliado: parseFloat(residuo.peso_conciliado),
            },
          });

          console.log("      ✅ Residuo asociado correctamente. Relación ID:", relacionCreada?.id);
        } else {
          // RESIDUO EXISTENTE - Solo actualizar
          console.log("      📝 Actualizando residuo existente");
          
          await apiRequest(`/actas-generacion-residuo/${residuo.acta_generacion_residuo_id}/`, {
            method: "PATCH",
            body: {
              peso_conciliado: parseFloat(residuo.peso_conciliado),
            },
          });

          console.log("      ✅ Peso conciliado actualizado");

          if (residuo.generacion_residuo_id) {
            console.log("      📝 Actualizando generación de residuo");
            
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
              generacionData.peso = parseFloat(residuo.peso_reportado);
            }

            if (Object.keys(generacionData).length > 0) {
              await apiRequest(`/generacion-residuo/${residuo.generacion_residuo_id}/`, {
                method: "PATCH",
                body: generacionData,
              });
              console.log("      ✅ Generación actualizada");
            }
          }
        }
      }

      console.log("✅ Todos los residuos procesados correctamente");

      // PASO 3: Eliminar novedades
      console.log("📝 PASO 3: Eliminando novedades resueltas");
      try {
        const novedades = await apiRequest<any[]>("/novedad-conciliacion/", {
          method: "GET",
        });

        const novedadesDelActa = novedades.filter((n) =>
          residuosEditables.some((r) => r.acta_generacion_residuo_id === n.acta_generacion_residuo_id)
        );

        console.log(`   Encontradas ${novedadesDelActa.length} novedades para eliminar`);

        for (const novedad of novedadesDelActa) {
          await apiRequest(`/novedad-conciliacion/${novedad.id}/`, {
            method: "DELETE",
          });
          console.log(`   ✅ Novedad ${novedad.id} eliminada`);
        }
      } catch (err) {
        console.warn("⚠️ No se pudieron eliminar novedades:", err);
      }

      console.log("🎉 Conciliación completada exitosamente");
      alert("✅ Acta conciliada exitosamente. La novedad ha sido resuelta.");

      await onSuccess();
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

  return {
    modalConciliarAbierto,
    actaConciliando,
    residuosEditables,
    residuosFiltrados,
    guardando,
    abrirModalResolverNovedad,
    cerrarModalConciliar,
    handleGuardarConciliacion,
    handlers: {
      onCambioPesoConciliado: handleCambioPesoConciliado,
      onCambioResiduo: handleCambioResiduo,
      onCambioMotivo: handleCambioMotivo,
      onCambioSubarea: handleCambioSubarea,
      onCambioCentroCosto: handleCambioCentroCosto,
      onCambioOperario: handleCambioOperario,
      onCambioConciliador: handleCambioConciliador,
      onCambioConsecutivo: handleCambioConsecutivo,
      onCambioNumeroInventario: handleCambioNumeroInventario,
      onCambioOperarioDocumento: handleCambioOperarioDocumento,
      onCambioConciliadorDocumento: handleCambioConciliadorDocumento,
      onAgregarResiduo: handleAgregarResiduo,
      onEliminarResiduo: handleEliminarResiduo,
      onCambioPesoReportado: handleCambioPesoReportado,
      onCambioDescripcionResiduoOtro: handleCambioDescripcionResiduoOtro,
      onCambioDescripcionMotivoOtro: handleCambioDescripcionMotivoOtro,
    },
  };
};