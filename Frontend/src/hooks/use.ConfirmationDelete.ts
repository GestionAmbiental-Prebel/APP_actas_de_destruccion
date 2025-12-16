// hooks/useConfirmationDelete.ts
import { useState, useCallback } from 'react';

interface UseConfirmationDeleteProps {
  onEliminar: (id: number | string) => Promise<void>;
  tipoRegistro: string;
  mensajePersonalizado?: string;
  verificarDependencias?: (id: number | string) => Promise<{
    tieneDependencias: boolean;
    mensaje?: string;
    detalles?: string[];
  }>;
}

interface RegistroParaEliminar {
  id: number | string;
  [key: string]: any;
}

export function useConfirmationDelete({
  onEliminar,
  tipoRegistro,
  mensajePersonalizado,
  verificarDependencias
}: UseConfirmationDeleteProps) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [registroAEliminar, setRegistroAEliminar] = useState<RegistroParaEliminar | null>(null);
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [infoDependencias, setInfoDependencias] = useState<{
    tieneDependencias: boolean;
    mensaje?: string;
    detalles?: string[];
  } | null>(null);
  const [verificandoDependencias, setVerificandoDependencias] = useState(false);

  const solicitarEliminacion = useCallback(async (registro: RegistroParaEliminar) => {
    // No establecer registroAEliminar todavía
    setVerificandoDependencias(true);
    
    let registroConInfo = { ...registro };
    let dependenciasInfo = null;
    
    // Verificar dependencias si se proporciona la función
    if (verificarDependencias) {
      try {
        const dependencias = await verificarDependencias(registro.id);
        dependenciasInfo = dependencias;
        
        // Si tiene dependencias, configurar el registro como bloqueado
        if (dependencias.tieneDependencias) {
          registroConInfo = {
            ...registro,
            bloqueado: true,
            mensajeBloqueo: dependencias.mensaje || `Este ${tipoRegistro} no puede ser eliminado porque tiene dependencias activas`
          };
        }
      } catch (error) {
        console.error('Error al verificar dependencias:', error);
        dependenciasInfo = {
          tieneDependencias: false
        };
      }
    }
    
    // Ahora establecer todos los estados a la vez
    setInfoDependencias(dependenciasInfo);
    setRegistroAEliminar(registroConInfo);
    setMostrarConfirmacion(true);
    setVerificandoDependencias(false);
    
  }, [verificarDependencias, tipoRegistro]);

  const cancelarEliminacion = useCallback(() => {
    setMostrarConfirmacion(false);
    setRegistroAEliminar(null);
    setInfoDependencias(null);
    setLoadingEliminar(false);
    setVerificandoDependencias(false);
  }, []);

  const confirmarEliminacion = useCallback(async () => {
    if (!registroAEliminar) return;
    
    try {
      setLoadingEliminar(true);
      await onEliminar(registroAEliminar.id);
      setMostrarConfirmacion(false);
      setRegistroAEliminar(null);
      setInfoDependencias(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      throw error; // Importante: re-lanzar el error para que el componente lo maneje
    } finally {
      setLoadingEliminar(false);
    }
  }, [registroAEliminar, onEliminar]);

  return {
    mostrarConfirmacion,
    registroAEliminar,
    loadingEliminar,
    infoDependencias,
    verificandoDependencias,
    solicitarEliminacion,
    cancelarEliminacion,
    confirmarEliminacion
  };
}