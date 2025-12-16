// components/GestionOperariosPuntoVerde.tsx
import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../services/api.service';
import { obtenerSubAreas, SubArea } from '../../services/catalogo.service';
import Button from '../../components/common/Button';
import FiltrosActas from '../../components/common/FilteredDateActas';
import { normalizarNombre } from '../../utils/normalizarNombre';
import ConfirmationDelete from '../../components/common/ConfirmationDelete';
import { useConfirmationDelete } from '../../hooks/use.ConfirmationDelete';

interface Operario {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  subarea_id: number;
}

interface Acta {
  id: number;
  numero_acta: string;
  fecha: string;
  estado: string;
  // Campos de documentos
  documento_entrega?: string;
  documento_recepcion?: string;
  operario_documento?: string;
  conciliador_documento?: string;
  [key: string]: any;
}

export default function GestionOperariosPuntoVerde() {
  // Estados para datos
  const [operarios, setOperarios] = useState<Operario[]>([]);
  const [operariosFiltrados, setOperariosFiltrados] = useState<Operario[]>([]);
  const [subAreas, setSubAreas] = useState<SubArea[]>([]);
  const [subAreaPuntoVerdeId, setSubAreaPuntoVerdeId] = useState<number | null>(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    apellido: '',
    documento: '',
  });
  
  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');

  // Ref para el formulario
  const formularioRef = useRef<HTMLDivElement>(null);

  // ✅✅✅ FUNCIÓN CORREGIDA: Verificar si el operario está en CUALQUIER acta
  const verificarConciliacionesOperario = async (operarioId: number | string): Promise<{
    tieneDependencias: boolean;
    mensaje?: string;
    detalles?: string[];
  }> => {
    try {
      console.log(`🔍 BÚSQUEDA EXHAUSTIVA para operario ID: ${operarioId}`);
      
      // 1. Buscar el operario para obtener su documento
      const operario = operarios.find(op => op.id === Number(operarioId));
      
      if (!operario) {
        console.error(`❌ No se encontró el operario con ID ${operarioId}`);
        return {
          tieneDependencias: true,
          mensaje: 'Error: No se encontró el operario'
        };
      }
      
      const documentoOperario = operario.documento;
      console.log(`📄 Documento del operario a buscar: ${documentoOperario}`);
      console.log(`👤 Nombre del operario: ${operario.nombre} ${operario.apellido}`);
      
      // 2. Obtener todas las actas
      const actas: Acta[] = await apiRequest('/actas/');
      console.log(`📋 Total de actas obtenidas: ${actas.length}`);
      
      const actasConOperario: any[] = [];
      
      // 3. Búsqueda exhaustiva en TODAS las actas
      actas.forEach(acta => {
        let camposEncontrados: string[] = [];
        
        // Buscar en campos específicos de documentos
        if (acta.documento_recepcion === documentoOperario) {
          camposEncontrados.push(`documento_recepcion: ${acta.documento_recepcion}`);
        }
        
        if (acta.conciliador_documento === documentoOperario) {
          camposEncontrados.push(`conciliador_documento: ${acta.conciliador_documento}`);
        }
        
        if (acta.operario_documento === documentoOperario) {
          camposEncontrados.push(`operario_documento: ${acta.operario_documento}`);
        }
        
        // Buscar en cualquier campo que contenga "documento" y coincida
        Object.keys(acta).forEach(key => {
          if (key.toLowerCase().includes('documento') && acta[key] === documentoOperario) {
            if (!camposEncontrados.includes(`${key}: ${acta[key]}`)) {
              camposEncontrados.push(`${key}: ${acta[key]}`);
            }
          }
        });
        
        // 🔍 CRÍTICO: Buscar en arrays (según los logs anteriores)
        Object.keys(acta).forEach(key => {
          const valor = acta[key];
          if (Array.isArray(valor)) {
            // Verificar si el array contiene el documento del operario
            if (valor.includes(documentoOperario)) {
              camposEncontrados.push(`${key} (array): [${valor.join(', ')}]`);
            }
            // Verificar si el array contiene números que podrían ser el ID
            valor.forEach((item: any) => {
              if (item && item.toString() === documentoOperario) {
                camposEncontrados.push(`${key} (array item): ${item}`);
              }
            });
          }
        });
        
        if (camposEncontrados.length > 0) {
          console.log(`🚨 OPERARIO ENCONTRADO en acta ${acta.numero_acta || acta.id}:`, camposEncontrados);
          actasConOperario.push({
            ...acta,
            campos_encontrados: camposEncontrados
          });
        }
      });
      
      console.log(`🚨🚨🚨 RESULTADO FINAL: Operario encontrado en ${actasConOperario.length} acta(s)`);
      
      // 4. Mostrar información detallada en consola
      if (actasConOperario.length > 0) {
        actasConOperario.forEach((acta, index) => {
          console.log(`\n📄 Acta ${index + 1}:`);
          console.log(`   Número: ${acta.numero_acta || acta.id}`);
          console.log(`   Estado: ${acta.estado || 'No especificado'}`);
          console.log(`   Fecha: ${acta.fecha || 'No especificada'}`);
          console.log(`   Campos donde aparece: ${acta.campos_encontrados.join(', ')}`);
        });
        
        // ✅✅✅ CAMBIO CRÍTICO: SIEMPRE bloquear si está en alguna acta
        return {
          tieneDependencias: true, // ¡SIEMPRE true si hay actas!
          mensaje: `⛔ ELIMINACIÓN BLOQUEADA: El operario "${operario.nombre} ${operario.apellido}" está registrado en ${actasConOperario.length} acta(s). 
                   Eliminarlo comprometería la integridad histórica de quién concilió esas actas.`,
          detalles: actasConOperario.map(acta => 
            `Acta ${acta.numero_acta || acta.id} - Estado: "${acta.estado || 'N/A'}" - Fecha: ${acta.fecha ? new Date(acta.fecha).toLocaleDateString('es-CO') : 'N/A'}`
          )
        };
      }
      
      console.log(`✅ Operario ${documentoOperario} NO está en ninguna acta - PUEDE SER ELIMINADO`);
      return {
        tieneDependencias: false,
        mensaje: '✅ El operario no está registrado en ninguna acta y puede ser eliminado'
      };
      
    } catch (error) {
      console.error('❌ Error crítico en verificación:', error);
      // Por seguridad absoluta, bloquear si hay error
      return {
        tieneDependencias: true,
        mensaje: '⚠️ No se pudo completar la verificación. Por precaución, no se permite la eliminación.'
      };
    }
  };

  // Función para manejar la eliminación con BLOQUEO ABSOLUTO
  const eliminarOperarioHandler = async (id: number | string) => {
    try {
      // VERIFICACIÓN EXTREMA antes de intentar eliminar
      console.log(`🛡️ Iniciando verificación de seguridad para operario ID: ${id}`);
      const dependencias = await verificarConciliacionesOperario(id);
      
      if (dependencias.tieneDependencias) {
        // Crear un error de BLOQUEO
        const errorBloqueo = new Error(`🚫 BLOQUEO DE SEGURIDAD: ${dependencias.mensaje}`);
        (errorBloqueo as any).esErrorBloqueo = true;
        (errorBloqueo as any).detalles = dependencias.detalles;
        throw errorBloqueo;
      }
      
      // Solo proceder si NO hay dependencias
      console.log(`🔄 Procediendo con eliminación del operario ${id}...`);
      
      const response = await apiRequest(`/operarios/${id}/`, {
        method: 'DELETE',
      });
      
      // Encontrar el operario eliminado para mostrar mensaje
      const operarioEliminado = operarios.find(op => op.id === Number(id));
      if (operarioEliminado) {
        setSuccess(`✅ Operario "${operarioEliminado.nombre} ${operarioEliminado.apellido}" eliminado exitosamente`);
      } else {
        setSuccess('✅ Operario eliminado exitosamente');
      }
      
      // Recargar lista
      await cargarOperarios();
      
    } catch (err: any) {
      console.error('❌ Error en eliminación:', err);
      
      // Manejar error de bloqueo especial
      if (err.esErrorBloqueo) {
        // Mostrar mensaje de bloqueo en la UI
        setError(err.message);
        
        // Lanzar error para que el modal lo muestre
        throw new Error(`🚫 ${err.message}`);
      }
      
      let mensajeError = 'Error al eliminar el operario';
      
      if (err.message?.includes('404')) {
        mensajeError = 'Operario no encontrado (puede haber sido eliminado)';
      } else if (err.message?.includes('500')) {
        mensajeError = 'Error del servidor. No se pudo eliminar el operario';
      } else if (err.message?.includes('409')) {
        mensajeError = 'El operario no puede ser eliminado porque está registrado en actas existentes';
      } else if (err.message?.includes('403')) {
        mensajeError = 'No tiene permisos para eliminar este operario';
      } else if (err.message?.includes('🚫')) {
        mensajeError = err.message;
      }
      
      setError(mensajeError);
      throw err; // Re-lanzar el error
    }
  };

  // Hook para manejar la confirmación de eliminación
  const {
    mostrarConfirmacion,
    registroAEliminar,
    loadingEliminar,
    infoDependencias,
    verificandoDependencias,
    solicitarEliminacion,
    cancelarEliminacion,
    confirmarEliminacion
  } = useConfirmationDelete({
    onEliminar: eliminarOperarioHandler,
    tipoRegistro: 'operario',
    verificarDependencias: verificarConciliacionesOperario
  });

  // Cargar subáreas al iniciar
  useEffect(() => {
    cargarSubAreas();
  }, []);

  // Cargar operarios cuando se tenga el ID de Punto Verde
  useEffect(() => {
    if (subAreaPuntoVerdeId) {
      cargarOperarios();
    }
  }, [subAreaPuntoVerdeId]);

  // Filtrar operarios cuando cambia la búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setOperariosFiltrados(operarios);
      return;
    }

    const busquedaLower = busqueda.toLowerCase().trim();
    const filtrados = operarios.filter(op => {
      const nombreCompleto = `${op.nombre} ${op.apellido}`.toLowerCase();
      return (
        nombreCompleto.includes(busquedaLower) ||
        op.documento.includes(busquedaLower) ||
        op.nombre.toLowerCase().includes(busquedaLower) ||
        op.apellido.toLowerCase().includes(busquedaLower)
      );
    });
    
    setOperariosFiltrados(filtrados);
  }, [busqueda, operarios]);

  const cargarSubAreas = async () => {
    try {
      const data = await obtenerSubAreas();
      setSubAreas(data);
      
      // Buscar subárea "Punto Verde" de forma flexible
      const puntoVerde = data.find(subarea => {
        const nombreLower = subarea.nombre.toLowerCase();
        return (
          nombreLower.includes('punto') && 
          nombreLower.includes('verde')
        ) || nombreLower === 'punto verde';
      });
      
      if (puntoVerde) {
        setSubAreaPuntoVerdeId(puntoVerde.id);
      } else {
        setError('No se encontró la subárea "Punto Verde". Contacte al administrador.');
      }
    } catch (err) {
      console.error('Error cargando subáreas:', err);
      setError('Error al cargar las subáreas');
    }
  };

  const cargarOperarios = async () => {
    if (!subAreaPuntoVerdeId) {
      setError('No se puede cargar operarios: Subárea Punto Verde no encontrada');
      return;
    }

    setLoadingList(true);
    try {
      const data = await apiRequest<Operario[]>('/operarios/');
      
      // Filtrar solo operarios de Punto Verde
      const operariosPuntoVerde = data.filter(op => op.subarea_id === subAreaPuntoVerdeId);
      
      setOperarios(operariosPuntoVerde);
      setOperariosFiltrados(operariosPuntoVerde);
      
    } catch (err) {
      console.error('Error cargando operarios:', err);
      setError('Error al cargar los operarios');
    } finally {
      setLoadingList(false);
    }
  };

  const validarFormulario = (): boolean => {
    setError('');
    
    const nombreNormalizado = normalizarNombre(formData.nombre);
    const apellidoNormalizado = normalizarNombre(formData.apellido);
    
    if (!nombreNormalizado.trim()) {
      setError('El nombre es requerido');
      return false;
    }

    if (!apellidoNormalizado.trim()) {
      setError('El apellido es requerido');
      return false;
    }

    if (!formData.documento.trim()) {
      setError('El documento es requerido');
      return false;
    }

    if (!/^\d+$/.test(formData.documento)) {
      setError('El documento solo debe contener números');
      return false;
    }

    if (formData.documento.length < 5 || formData.documento.length > 15) {
      setError('El documento debe tener entre 5 y 15 dígitos');
      return false;
    }

    // Validar que el documento no esté duplicado
    const documentoDuplicado = operarios.find(op => 
      op.documento === formData.documento && 
      (!modoEdicion || op.id !== formData.id)
    );
    
    if (documentoDuplicado) {
      setError(`El documento ${formData.documento} ya está registrado para ${documentoDuplicado.nombre} ${documentoDuplicado.apellido}`);
      return false;
    }

    if (!subAreaPuntoVerdeId) {
      setError('No se pudo determinar la subárea Punto Verde');
      return false;
    }

    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'documento') {
      const soloNumeros = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: soloNumeros }));
    } else if (name === 'nombre' || name === 'apellido') {
      const soloLetrasYEspacios = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      const sinEspaciosMultiples = soloLetrasYEspacios.replace(/\s+/g, ' ');
      setFormData(prev => ({ ...prev, [name]: sinEspaciosMultiples }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'nombre' || name === 'apellido') {
      if (value.trim()) {
        const normalizado = normalizarNombre(value);
        setFormData(prev => ({ ...prev, [name]: normalizado }));
      }
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      id: 0,
      nombre: '',
      apellido: '',
      documento: '',
    });
    setModoEdicion(false);
    setError('');
    setSuccess('');
  };

  const limpiarFiltros = () => {
    setBusqueda('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const nombreNormalizado = normalizarNombre(formData.nombre);
      const apellidoNormalizado = normalizarNombre(formData.apellido);
      
      const payload = {
        nombre: nombreNormalizado,
        apellido: apellidoNormalizado,
        documento: formData.documento.trim(),
        subarea_id: subAreaPuntoVerdeId,
      };

      if (modoEdicion) {
        await apiRequest(`/operarios/${formData.id}/`, {
          method: 'PUT',
          body: payload,
        });
        
        setSuccess(`✅ Operario "${nombreNormalizado} ${apellidoNormalizado}" actualizado exitosamente`);
      } else {
        await apiRequest('/operarios/', {
          method: 'POST',
          body: payload,
        });
        
        setSuccess(`✅ Operario "${nombreNormalizado} ${apellidoNormalizado}" registrado exitosamente`);
      }

      await cargarOperarios();
      limpiarFormulario();

    } catch (err: any) {
      console.error('Error al guardar operario:', err);
      
      let mensajeError = 'Error al guardar el operario';
      
      if (err.message?.includes('400')) {
        mensajeError = 'Datos inválidos. Verifique la información ingresada.';
      } else if (err.message?.includes('404')) {
        mensajeError = 'Operario no encontrado (puede haber sido eliminado)';
      } else if (err.message?.includes('409')) {
        mensajeError = 'El documento ya está registrado';
      } else if (err.message?.includes('500')) {
        mensajeError = 'Error del servidor. Intente nuevamente.';
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const editarOperario = (operario: Operario) => {
    if (operario.subarea_id !== subAreaPuntoVerdeId) {
      setError('No se puede editar este operario porque no pertenece a Punto Verde');
      return;
    }
    
    setFormData({
      id: operario.id,
      nombre: operario.nombre,
      apellido: operario.apellido,
      documento: operario.documento,
    });
    setModoEdicion(true);
    setError('');
    setSuccess('');
    
    setTimeout(() => {
      if (formularioRef.current) {
        formularioRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const confirmarEliminarOperario = (operario: Operario) => {
    if (operario.subarea_id !== subAreaPuntoVerdeId) {
      setError('No se puede eliminar este operario porque no pertenece a Punto Verde');
      return;
    }
    
    solicitarEliminacion({
      id: operario.id,
      nombre: operario.nombre,
      apellido: operario.apellido,
      documento: operario.documento,
      subarea_id: operario.subarea_id
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-skyBlue dark:text-lightBlue text-center mb-8">
        👥 Gestión de Operarios - Punto Verde
      </h1>

      {/* Información de subárea */}
      {subAreaPuntoVerdeId ? (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Subárea asignada:</span>{' '}
                {subAreas.find(s => s.id === subAreaPuntoVerdeId)?.nombre || 'Punto Verde'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="font-semibold">ID de subárea:</span> {subAreaPuntoVerdeId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ Configuración correcta
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-700 dark:text-red-300">
            ⚠️ No se encontró la subárea "Punto Verde". No se pueden cargar los operarios.
          </p>
        </div>
      )}

      {/* Mensajes de éxito/error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
          <p className="font-medium">❌ {error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
          <p className="font-medium">{success}</p>
        </div>
      )}

      {/* Formulario de registro/edición */}
      <div 
        ref={formularioRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 scroll-mt-24"
      >
        <h2 className="text-xl font-bold mb-6">
          {modoEdicion ? (
            <span className="flex items-center gap-2">
              <span className="text-yellow-500">✏️ Editando Operario</span>
              <span className="text-sm font-normal text-gray-500">
                {normalizarNombre(formData.nombre)} {normalizarNombre(formData.apellido)}
              </span>
            </span>
          ) : '📝 Registrar Nuevo Operario'}
        </h2>

        {modoEdicion && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
              ⚠️ Estás editando el operario: <span className="font-bold">{normalizarNombre(formData.nombre)} {normalizarNombre(formData.apellido)}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombres */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium mb-2">
                Nombres *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Juan Carlos"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-skyBlue focus:border-transparent dark:bg-gray-700"
                required
                disabled={loading || !subAreaPuntoVerdeId}
              />
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Pérez López"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-skyBlue focus:border-transparent dark:bg-gray-700"
                required
                disabled={loading || !subAreaPuntoVerdeId}
              />
            </div>
          </div>

          {/* Documento */}
          <div>
            <label htmlFor="documento" className="block text-sm font-medium mb-2">
              Número de Documento *
            </label>
            <input
              type="text"
              id="documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              placeholder="Ej: 1234567890"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-skyBlue focus:border-transparent dark:bg-gray-700"
              required
              maxLength={15}
              disabled={loading || !subAreaPuntoVerdeId}
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">Solo números, sin puntos ni comas</p>
              <p className="text-xs text-gray-500">{formData.documento.length}/15</p>
            </div>
          </div>

          {/* Botones del formulario */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !subAreaPuntoVerdeId}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {modoEdicion ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                <>
                  {modoEdicion ? '💾 Guardar Cambios' : '📝 Registrar Operario'}
                </>
              )}
            </Button>
            
            {modoEdicion && (
              <Button
                type="button"
                variant="secondary"
                onClick={limpiarFormulario}
                disabled={loading}
                className="flex-1"
              >
                ↩️ Cancelar Edición
              </Button>
            )}
            
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                limpiarFormulario();
                if (subAreaPuntoVerdeId) {
                  cargarOperarios();
                }
              }}
              disabled={loading || !subAreaPuntoVerdeId}
              className="flex-1"
            >
              🔄 Recargar Lista
            </Button>
          </div>
        </form>
      </div>

      {/* Lista de operarios con filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">👥 Operarios Registrados</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Total: {operarios.length} operarios
            </p>
            {busqueda && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Mostrando {operariosFiltrados.length} resultado(s)
              </p>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <FiltrosActas
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            fechaInicio={""}
            setFechaInicio={() => {}}
            fechaFin={""}
            setFechaFin={() => {}}
            limpiarFiltros={limpiarFiltros}
            onRefrescar={() => subAreaPuntoVerdeId && cargarOperarios()}
            loading={loadingList}
            labelBusqueda="Buscar por nombre, apellido o documento"
            placeholderBusqueda="Ej: Juan / 12345678 / Pérez"
            MAX_BUSQUEDA={30}
          />
        </div>

        {!subAreaPuntoVerdeId ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">⚠️ Subárea Punto Verde no configurada</div>
            <p className="text-gray-500">No se pueden cargar operarios.</p>
          </div>
        ) : loadingList ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-skyBlue border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Cargando operarios...</p>
          </div>
        ) : operarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay operarios registrados en Punto Verde.</p>
          </div>
        ) : operariosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron operarios con "{busqueda}"</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Documento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nombres</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Apellidos</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {operariosFiltrados.map(op => (
                  <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-mono">{op.documento}</td>
                    <td className="px-4 py-3">{op.nombre}</td>
                    <td className="px-4 py-3">{op.apellido || '---'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editarOperario(op)}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                          disabled={verificandoDependencias}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => confirmarEliminarOperario(op)}
                          disabled={verificandoDependencias}
                          className={`px-3 py-1 rounded text-sm transition ${
                            verificandoDependencias 
                              ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed'
                              : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
                          }`}
                        >
                          {verificandoDependencias ? '⏳ Verificando...' : '🗑️ Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      {mostrarConfirmacion && registroAEliminar && (
        <ConfirmationDelete
          registro={registroAEliminar}
          tipoRegistro="operario"
          camposMostrar={['nombre', 'apellido', 'documento']}
          mensajePersonalizado="¿Está seguro de eliminar este operario de Punto Verde?"
          onConfirmar={confirmarEliminacion}
          onCancelar={cancelarEliminacion}
          requiereConfirmacionTexto={!registroAEliminar.bloqueado}
          textoConfirmacion="ELIMINAR OPERARIO"
          tieneDependencias={infoDependencias?.tieneDependencias || false}
          mensajeDependencias={infoDependencias?.mensaje}
          loading={loadingEliminar}
          size="md"
        />
      )}

     
    </div>
  );
}