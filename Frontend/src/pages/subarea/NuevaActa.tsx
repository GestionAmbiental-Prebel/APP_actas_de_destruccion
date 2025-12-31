import { useState, useEffect, useRef } from 'react';
import SeccionIdentificacion from '../../components/form/SeccionIdentificacion';
import SeccionUbicacion from '../../components/form/SeccionUbicacion';
import SeccionResiduos, { Residuo } from '../../components/form/SeccionResiduos';
import Button from '../../components/common/Button';
import useCatalogos from '../../hooks/useCatalogos';
import useOperario from '../../hooks/use.Operario';
import { crearActaCompleta } from '../../services/actas.service';
import { obtenerOCrearOperario } from '../../services/operarios.service';
import { normalizarNombre } from '../../utils/normalizarNombre';

export default function NuevaActa() {
  // ===== HOOKS =====
  const { 
    centrosCosto, 
    subAreas, 
    areas, 
    procedencias, 
    sedes,
    residuosEspecificos,
    categoriasResiduos,
    loading, 
    error 
  } = useCatalogos();
  
  const { operario, buscando, buscarPorCedula, limpiar } = useOperario();

  // ===== ESTADO DEL FORMULARIO =====
  
  // Identificación
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  
  // Datos a nivel de acta
  const [consecutivo, setConsecutivo] = useState('');
  const [numeroInventario, setNumeroInventario] = useState('');

  // Ubicación
  const [centroCostoId, setCentroCostoId] = useState<number | null>(null);
  const [subAreaId, setSubAreaId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [procedenciaId, setProcedenciaId] = useState<number | null>(null);
  const [sedeId, setSedeId] = useState<number | null>(null);

  // Residuos
  const [residuos, setResiduos] = useState<Residuo[]>([
    { residuo_id: null, categoria_id: null, motivo: '', peso: '' }
  ]);

  // Motivos 
  const motivos = ['Bloqueado', 'Obsoleto', 'Rechazado', 'Vencido', 'Otro'];

  // Estado del envío
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [numeroActaGenerado, setNumeroActaGenerado] = useState('');

  // Ref para el modal
  const modalRef = useRef<HTMLDivElement | null>(null);

  // ===== EFECTOS =====
  useEffect(() => {
    if (!loading && residuosEspecificos.length > 0) {
      const residuosOtro = residuosEspecificos.filter(r => r.nombre === 'Otro');
      const categoriasGenericas = categoriasResiduos.filter(c => 
        c.nombre === 'GENÉRICO' && (c.subarea_id === null || c.subarea_id === undefined)
      );
      console.log('Residuos "Otro":', residuosOtro, 'Categorías "GENÉRICO":', categoriasGenericas);
    }
  }, [loading, residuosEspecificos, categoriasResiduos]);

  useEffect(() => {
    if (operario) {
      setNombre(operario.nombre || '');
      setApellido(operario.apellido || '');
      if (operario.subarea_id) {
        setSubAreaId(operario.subarea_id);
        autocompletarUbicacionDesdeSubArea(operario.subarea_id);
      }
    }
  }, [operario]);

  // ===== FUNCIONES AUXILIARES =====
  const autocompletarUbicacionDesdeSubArea = (subareaId: number) => {
    const subArea = subAreas.find(sa => sa.id === subareaId);
    if (!subArea) return;
    setSubAreaId(subArea.id);
    setAreaId(subArea.area_id);
    const area = areas.find(a => a.id === subArea.area_id);
    if (!area) return;
    setProcedenciaId(area.procedencia_id);
    const procedencia = procedencias.find(p => p.id === area.procedencia_id);
    if (!procedencia) return;
    setSedeId(procedencia.sede_id);
  };

  const autocompletarUbicacionDesdeCentroCosto = (centroCostoId: number) => {
    const centro = centrosCosto.find(cc => cc.id === centroCostoId);
    if (!centro || !centro.subarea_id) return;
    autocompletarUbicacionDesdeSubArea(centro.subarea_id);
  };

  // Función mejorada para obtener residuos disponibles (incluye residuos globales)
  const obtenerResiduosDisponibles = () => {
    // Si no hay subárea seleccionada, mostrar todos los residuos
    if (!subAreaId) {
      return residuosEspecificos;
    }
    
    // 1. Residuos específicos de la subárea seleccionada
    const categoriasDeSubArea = categoriasResiduos.filter(cat => 
      cat.subarea_id === subAreaId
    );
    const categoriaIdsSubArea = categoriasDeSubArea.map(cat => cat.id);
    const residuosDeSubArea = residuosEspecificos.filter(res => 
      categoriaIdsSubArea.includes(res.categoria_id)
    );
    
    // 2. Residuos de categorías genéricas (disponibles en todas las subáreas)
    const categoriasGenericas = categoriasResiduos.filter(cat => 
      // Categoría GENÉRICO con subarea_id NULL (global)
      (cat.nombre === 'GENÉRICO' && (cat.subarea_id === null || cat.subarea_id === undefined))
    );
    
    const categoriaIdsGenericas = categoriasGenericas.map(cat => cat.id);
    const residuosGenericos = residuosEspecificos.filter(res => 
      categoriaIdsGenericas.includes(res.categoria_id)
    );
    
    // 3. Evitar duplicados (por si acaso)
    const idsVistos = new Set();
    const todosResiduos = [...residuosDeSubArea, ...residuosGenericos].filter(res => {
      if (idsVistos.has(res.id)) return false;
      idsVistos.add(res.id);
      return true;
    });
    
    return todosResiduos;
  };

  // Función mejorada para obtener categorías disponibles
  const obtenerCategoriasDisponibles = () => {
    // Si no hay subárea seleccionada, mostrar todas las categorías
    if (!subAreaId) {
      return categoriasResiduos;
    }
    
    // 1. Categorías de la subárea seleccionada
    const categoriasDeSubArea = categoriasResiduos.filter(cat => 
      cat.subarea_id === subAreaId
    );
    
    // 2. Categorías genéricas (globales)
    const categoriasGenericas = categoriasResiduos.filter(cat => 
      cat.nombre === 'GENÉRICO' && (cat.subarea_id === null || cat.subarea_id === undefined)
    );
    
    // 3. Evitar duplicados
    const idsVistos = new Set();
    const todasCategorias = [...categoriasDeSubArea, ...categoriasGenericas].filter(cat => {
      if (idsVistos.has(cat.id)) return false;
      idsVistos.add(cat.id);
      return true;
    });
    
    return todasCategorias;
  };

  const obtenerNombres = () => {
    const subArea = subAreas.find(sa => sa.id === subAreaId);
    const area = areas.find(a => a.id === areaId);
    const procedencia = procedencias.find(p => p.id === procedenciaId);
    const sede = sedes.find(s => s.id === sedeId);
    return {
      subAreaNombre: subArea?.nombre || '',
      areaNombre: area?.nombre || '',
      procedenciaNombre: procedencia?.nombre || '',
      sedeNombre: sede?.nombre || ''
    };
  };

  // Función para determinar si es área de almacenamiento
  const determinarEsAlmacenamiento = (): boolean => {
    const nombres = obtenerNombres();
    if (!nombres.areaNombre) return false;
    
    const areaLower = nombres.areaNombre.toLowerCase();
    const areasAlmacenamiento = ['almacenamiento', 'almacen', 'bodega', 'depósito', 'inventarios', 'stock'];
    
    return areasAlmacenamiento.some(nombre => 
      areaLower.includes(nombre) || nombre.includes(areaLower)
    );
  };

  // ===== HANDLERS =====
  const handleCedulaBlur = () => {
    if (cedula.length >= 6) buscarPorCedula(cedula);
  };

  const handleCentroCostoChange = (centroCostoId: number) => {
    setCentroCostoId(centroCostoId);
    autocompletarUbicacionDesdeCentroCosto(centroCostoId);
  };

  const handleResiduoChange = (index: number, residuoId: number) => {
    const residuoSeleccionado = residuosEspecificos.find(r => r.id === residuoId);
    setResiduos(prev => {
      const copia = [...prev];
      copia[index].residuo_id = residuoId;
      copia[index].categoria_id = residuoSeleccionado?.categoria_id ?? null;
      return copia;
    });
  };

  const handleResiduoCampoChange = (index: number, campo: keyof Residuo, valor: string) => {
    setResiduos(prev => {
      const nuevos = [...prev];
      
      if (campo === 'residuo_id') {
        const residuoId = Number(valor);
        const residuoSeleccionado = residuosEspecificos.find(r => r.id === residuoId);
        
        nuevos[index] = {
          ...nuevos[index],
          residuo_id: residuoId,
          categoria_id: residuoSeleccionado?.categoria_id ?? null,
          motivo: '',
          motivo_otro: ''
        };
      } else {
        nuevos[index] = { ...nuevos[index], [campo]: valor };
      }
      
      return nuevos;
    });
  };

  const resetearFormulario = () => {
    setCedula('');
    setNombre('');
    setApellido('');
    setConsecutivo('');
    setNumeroInventario('');
    setCentroCostoId(null);
    setSubAreaId(null);
    setAreaId(null);
    setProcedenciaId(null);
    setSedeId(null);
    setResiduos([{ residuo_id: null, categoria_id: null, motivo: '', peso: '' }]);
    limpiar();
  };

  // Función para mostrar modal de error elegante
  const mostrarModalError = (errores: string[]) => {
    // Limpiar modal existente si hay uno
    if (modalRef.current) {
      modalRef.current.remove();
    }

    const modalError = document.createElement('div');
    modalError.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';
    modalError.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Validación de residuos</h3>
        </div>
        
        <div class="mb-6">
          <p class="text-gray-700 dark:text-gray-300 mb-3">Por favor, corrija los siguientes errores:</p>
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-60 overflow-y-auto">
            <ul class="space-y-2">
              ${errores.map(error => `<li class="text-red-700 dark:text-red-300 text-sm flex items-start">
                <svg class="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                ${error}
              </li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button id="modal-close-btn" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
            Entendido
          </button>
        </div>
      </div>
    `;
    
    // Estilos para la animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scale-in {
        0% { transform: scale(0.9); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .animate-scale-in {
        animation: scale-in 0.2s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modalError);
    modalRef.current = modalError;
    
    // Función para cerrar el modal
    const closeModal = () => {
      if (modalRef.current) {
        modalRef.current.remove();
        modalRef.current = null;
      }
      if (style.parentNode) {
        document.head.removeChild(style);
      }
    };
    
    // Agregar evento al botón de cerrar
    const closeButton = modalError.querySelector('#modal-close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }
    
    // Cerrar al hacer clic fuera del modal
    modalError.addEventListener('click', (e) => {
      if (e.target === modalError) {
        closeModal();
      }
    });
    
    // Cerrar con Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // Limpiar event listener cuando se cierre el modal
    modalError.addEventListener('click', () => {
      document.removeEventListener('keydown', handleEscape);
    }, { once: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!centroCostoId || !subAreaId) {
      mostrarModalError(['Por favor, seleccione un centro de costo']);
      return;
    }

    try {
      setEnviando(true);

      const operarioCreado = await obtenerOCrearOperario(cedula, nombre, apellido, subAreaId);

      const esAlmacenamiento = determinarEsAlmacenamiento();

      // Validar residuos según las nuevas reglas
      const errores: string[] = [];
      const residuosValidos = residuos.filter(r => {
        let valido = true;
        
        // Validación básica para todos los residuos
        if (!r.residuo_id) {
          errores.push(`Residuo ${residuos.indexOf(r) + 1}: Seleccione un tipo de residuo`);
          valido = false;
        }
        
        const pesoNum = parseFloat(r.peso);
        if (isNaN(pesoNum) || pesoNum < 0) {
          errores.push(`Residuo ${residuos.indexOf(r) + 1}: Ingrese un peso válido (mayor o igual a 0)`);
          valido = false;
        }

        // Validación para residuo "Otro"
        const residuoSeleccionado = residuosEspecificos.find(res => res.id === r.residuo_id);
        if (residuoSeleccionado?.nombre === 'Otro' && (!r.residuo_otro || r.residuo_otro.trim() === '')) {
          errores.push(`Residuo ${residuos.indexOf(r) + 1}: Especifique el tipo de residuo "Otro"`);
          valido = false;
        }

        // Validación para motivo "Otro"
        if (r.motivo === 'Otro' && (!r.motivo_otro || r.motivo_otro.trim() === '')) {
          errores.push(`Residuo ${residuos.indexOf(r) + 1}: Especifique el motivo "Otro"`);
          valido = false;
        }
        
        return valido;
      });

      if (residuosValidos.length === 0 || errores.length > 0) {
        setEnviando(false);
        mostrarModalError(errores);
        return;
      }

      const residuosDisponibles = obtenerResiduosDisponibles();

      const residuosParaEnviar = residuosValidos.map(r => {
        const residuoEspecifico = residuosDisponibles.find(res => res.id === r.residuo_id);
        
        return {
          residuo_id: r.residuo_id!,
          peso: r.peso,
          motivo: r.motivo || 'N/A',
          motivo_otro: r.motivo === 'Otro' ? r.motivo_otro || null : null,
          residuo_otro: residuoEspecifico?.nombre === 'Otro' ? r.residuo_otro || null : null,
        };
      });

      const resultado = await crearActaCompleta({
        cedula,
        nombre: normalizarNombre(nombre),
        apellido: normalizarNombre(apellido),
        subarea_id: subAreaId,
        centro_costo_id: centroCostoId,
        residuos: residuosParaEnviar,
        operario_id: operarioCreado.id,
        consecutivo: consecutivo || undefined,
        numero_inventario: numeroInventario || undefined
      });

      setNumeroActaGenerado(resultado.numeroActa);
      setMostrarExito(true);

      setTimeout(() => {
        resetearFormulario();
        setMostrarExito(false);
      }, 5000);

    } catch (error: any) {
      console.error('Error:', error);
      
      // Parsear el error específico del backend
      if (error.message?.includes('Error 400')) {
        try {
          const errorData = JSON.parse(error.message.split('Error 400: ')[1]);
          const erroresBackend: string[] = [];
          
          if (errorData.motivo) {
            erroresBackend.push(`Error de validación: ${errorData.motivo.join(', ')}`);
          }
          
          if (errorData.residuo) {
            erroresBackend.push(`Error en residuo: ${errorData.residuo.join(', ')}`);
          }
          
          mostrarModalError(erroresBackend.length > 0 ? erroresBackend : ['Error del servidor']);
        } catch (parseError) {
          mostrarModalError(['Error al procesar la respuesta del servidor']);
        }
      } else {
        mostrarModalError([`Error al crear el acta: ${error.message || 'Error desconocido'}`]);
      }
    } finally {
      setEnviando(false);
    }
  };

  // ===== RENDER =====
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-skyBlue mx-auto mb-4"></div>
        <p className="text-xl">Cargando formulario...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Recargar página</Button>
      </div>
    </div>
  );

  const nombres = obtenerNombres();
  const esAlmacenamiento = determinarEsAlmacenamiento();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-skyBlue dark:text-lightBlue">Nueva Acta</h1>

      {mostrarExito && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">¡Acta creada exitosamente!</h2>
              <p className="text-lg mb-4">Número de acta generado:</p>
              <p className="text-3xl font-mono font-bold text-skyBlue">{numeroActaGenerado}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <SeccionIdentificacion
          cedula={cedula}
          setCedula={setCedula}
          nombre={nombre}
          setNombre={setNombre}
          apellido={apellido}
          setApellido={setApellido}
          onCedulaBlur={handleCedulaBlur}
        />

        {buscando && <p className="text-sm text-gray-500 italic">🔍 Buscando operario...</p>}
        {operario && <p className="text-sm text-green-600">✓ Operario encontrado</p>}

        <SeccionUbicacion
          centroCostoId={centroCostoId}
          subAreaNombre={nombres.subAreaNombre}
          areaNombre={nombres.areaNombre}
          procedenciaNombre={nombres.procedenciaNombre}
          sedeNombre={nombres.sedeNombre}
          onCentroCostoChange={handleCentroCostoChange}
          centrosCosto={centrosCosto}
        />

        <SeccionResiduos
          residuos={residuos}
          setResiduos={setResiduos}
          residuosDisponibles={obtenerResiduosDisponibles()}
          categoriasDisponibles={obtenerCategoriasDisponibles()}
          motivos={motivos}
          onResiduoChange={handleResiduoChange}
          onResiduoCampoChange={handleResiduoCampoChange}
          consecutivo={consecutivo}
          numeroInventario={numeroInventario}
          onConsecutivoChange={setConsecutivo}
          onNumeroInventarioChange={setNumeroInventario}
          areaId={areaId}
          areaNombre={nombres.areaNombre}
          esAlmacenamiento={esAlmacenamiento}
          disabled={enviando}
        />

        <div className="flex gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={resetearFormulario} 
            disabled={enviando}
            className="px-6 py-3"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={enviando}
            className="px-6 py-3"
          >
            {enviando ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              'Enviar Acta'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}