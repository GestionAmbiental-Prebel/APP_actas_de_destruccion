// components/common/ConfirmationDelete.tsx
import { useState } from 'react';
import Button from './Button';

interface ConfirmationDeleteProps {
  // Datos del registro a eliminar
  registro: {
    id: number | string;
    nombre?: string;
    titulo?: string;
    descripcion?: string;
    bloqueado?: boolean; // Nueva propiedad para indicar si está bloqueado
    mensajeBloqueo?: string; // Mensaje específico de bloqueo
    [key: string]: any;
  };
  
  // Configuración
  tipoRegistro: string; // Ej: "operario", "acta", "proyecto"
  camposMostrar?: string[]; // Campos específicos a mostrar
  mensajePersonalizado?: string;
  
  // Callbacks
  onConfirmar: (id: number | string) => Promise<void>;
  onCancelar: () => void;
  
  // Validaciones adicionales
  requiereConfirmacionTexto?: boolean;
  textoConfirmacion?: string; // Texto que el usuario debe escribir para confirmar
  tieneDependencias?: boolean; // Si tiene relaciones con otros registros
  mensajeDependencias?: string;
  
  // UI
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function ConfirmationDelete({
  registro,
  tipoRegistro,
  camposMostrar = ['nombre', 'titulo', 'descripcion'],
  mensajePersonalizado,
  onConfirmar,
  onCancelar,
  requiereConfirmacionTexto = false,
  textoConfirmacion = "ELIMINAR",
  tieneDependencias = false,
  mensajeDependencias,
  loading = false,
  size = 'md'
}: ConfirmationDeleteProps) {
  const [textoIngresado, setTextoIngresado] = useState('');
  const [aceptoRiesgos, setAceptoRiesgos] = useState(false);
  
  // Determinar el título del registro
  const obtenerTitulo = () => {
    if (registro.nombre) return registro.nombre;
    if (registro.titulo) return registro.titulo;
    return `Registro #${registro.id}`;
  };
  
  // Determinar subtítulo/descripción
  const obtenerSubtitulo = () => {
    if (registro.descripcion) return registro.descripcion;
    return '';
  };
  
  // Verificar si el botón de confirmar debe estar habilitado
  const confirmarHabilitado = () => {
    if (loading) return false;
    if (registro.bloqueado) return false; // Si está bloqueado, no habilitar
    if (tieneDependencias && !aceptoRiesgos) return false;
    if (requiereConfirmacionTexto && textoIngresado !== textoConfirmacion) return false;
    return true;
  };
  
  // Estilos según tamaño (responsive)
  const estilosTamaño = {
    sm: 'max-w-md',
    md: 'max-w-2xl lg:max-w-lg', // Responsive para diferentes pantallas
    lg: 'max-w-4xl lg:max-w-2xl'
  };

  // Función para manejar la tecla Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancelar();
    }
  };

  // 🔴 VERIFICAR SI EL REGISTRO ESTÁ BLOQUEADO POR DEPENDENCIAS
  if (registro.bloqueado) {
    return (
      <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Encabezado de bloqueo */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate">🚫 No se puede eliminar</h3>
                  <p className="text-red-100 text-xs sm:text-sm mt-1">Registro bloqueado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de bloqueo */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <div className="text-red-500 text-lg">⚠️</div>
                <div>
                  <h4 className="font-bold text-red-700 dark:text-red-300 mb-2">
                    {registro.mensajeBloqueo || `Este ${tipoRegistro} no puede ser eliminado`}
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                    El registro tiene dependencias asociadas que deben ser eliminadas primero.
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Revise y elimine primero las dependencias</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Consulte con el administrador del sistema</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del registro */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Información del registro:</h5>
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm sm:min-w-[80px]">Nombre:</span>
                  <span className="font-medium text-sm sm:text-base break-words">{obtenerTitulo()}</span>
                </div>
                
                {obtenerSubtitulo() && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-gray-500 dark:text-gray-400 text-sm sm:min-w-[80px]">Descripción:</span>
                    <span className="text-xs sm:text-sm break-words">{obtenerSubtitulo()}</span>
                  </div>
                )}
                
                {/* Campos adicionales */}
                {camposMostrar.map((campo, index) => {
                  if (registro[campo] && !['nombre', 'titulo', 'descripcion'].includes(campo)) {
                    return (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm sm:min-w-[80px] capitalize break-words">
                          {campo.replace('_', ' ')}:
                        </span>
                        <span className="text-xs sm:text-sm break-words">{registro[campo]}</span>
                      </div>
                    );
                  }
                  return null;
                })}
                
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm sm:min-w-[80px]">ID:</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs break-all">
                    {registro.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón para cerrar */}
            <Button
              onClick={onCancelar}
              variant="secondary"
              className="w-full"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cerrar
              </div>
            </Button>
          </div>

          {/* Pie de página informativo */}
          <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                💡 Presione <kbd className="px-1 sm:px-2 py-0.5 sm:py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> para cerrar
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🔵 MODAL NORMAL (cuando NO está bloqueado)
  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      tabIndex={-1} // Para que pueda capturar eventos de teclado
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl ${estilosTamaño[size]} w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()} // Prevenir cierre al hacer clic dentro
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">⚠️ Confirmar Eliminación</h3>
                <p className="text-red-100 text-xs sm:text-sm mt-1">Acción irreversible</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido - Scrollable en móviles */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Información del registro */}
          <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-800">
            <p className="font-medium text-red-800 dark:text-red-200 mb-2 sm:mb-3 text-sm sm:text-base">
              {mensajePersonalizado || `¿Está seguro de eliminar ${tipoRegistro}?`}
            </p>
            
            <div className="space-y-1 sm:space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="text-red-600 dark:text-red-400 font-medium text-sm sm:min-w-[100px]">Registro:</span>
                <span className="font-semibold text-sm sm:text-base break-words">{obtenerTitulo()}</span>
              </div>
              
              {obtenerSubtitulo() && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="text-red-600 dark:text-red-400 font-medium text-sm sm:min-w-[100px]">Descripción:</span>
                  <span className="text-xs sm:text-sm break-words">{obtenerSubtitulo()}</span>
                </div>
              )}
              
              {/* Campos adicionales */}
              {camposMostrar.map((campo, index) => {
                if (registro[campo] && !['nombre', 'titulo', 'descripcion'].includes(campo)) {
                  return (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                      <span className="text-red-600 dark:text-red-400 font-medium text-sm sm:min-w-[100px] capitalize break-words">
                        {campo.replace('_', ' ')}:
                      </span>
                      <span className="text-sm break-words">{registro[campo]}</span>
                    </div>
                  );
                }
                return null;
              })}
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="text-red-600 dark:text-red-400 font-medium text-sm sm:min-w-[100px]">ID:</span>
                <span className="font-mono bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs sm:text-sm break-all">
                  {registro.id}
                </span>
              </div>
            </div>
          </div>

          {/* Advertencia principal */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <div className="text-amber-600 dark:text-amber-400 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm sm:text-base">⚠️ Advertencia Crítica</h4>
                <ul className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 mt-1 sm:mt-2 space-y-1">
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="flex-1 min-w-0">Esta acción <strong className="font-bold">NO SE PUEDE DESHACER</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="flex-1 min-w-0">El registro será eliminado <strong className="font-bold">permanentemente</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="flex-1 min-w-0">No habrá forma de recuperar la información</span>
                  </li>
                  {tipoRegistro === 'operario' && (
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="flex-1 min-w-0">Si el operario tiene actas asociadas, no podrá ser eliminado</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Validación de dependencias */}
          {tieneDependencias && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm sm:text-base">📋 Dependencias Detectadas</h4>
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400 mt-1 break-words">
                    {mensajeDependencias || `Este ${tipoRegistro} tiene relaciones con otros registros. La eliminación puede afectar la integridad de los datos.`}
                  </p>
                  <div className="mt-2 sm:mt-3 flex items-start">
                    <input
                      type="checkbox"
                      id="aceptoRiesgos"
                      checked={aceptoRiesgos}
                      onChange={(e) => setAceptoRiesgos(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="aceptoRiesgos" className="ml-2 text-xs sm:text-sm text-blue-700 dark:text-blue-400 break-words">
                      Entiendo los riesgos y deseo continuar con la eliminación
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validación de texto de confirmación */}
          {requiereConfirmacionTexto && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <div className="text-purple-600 dark:text-purple-400 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 text-sm sm:text-base">🔐 Confirmación de Seguridad</h4>
                  <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 mt-1 break-words">
                    Para confirmar la eliminación, escriba <code className="bg-purple-100 dark:bg-purple-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded font-mono font-bold text-xs sm:text-sm break-all">{textoConfirmacion}</code> en el campo de abajo:
                  </p>
                  <input
                    type="text"
                    value={textoIngresado}
                    onChange={(e) => setTextoIngresado(e.target.value)}
                    placeholder={`Escriba "${textoConfirmacion}" para confirmar`}
                    className="w-full mt-2 sm:mt-3 px-3 sm:px-4 py-2 text-sm sm:text-base border border-purple-300 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800"
                    autoComplete="off"
                  />
                  {textoIngresado && textoIngresado !== textoConfirmacion && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-2 flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>El texto no coincide</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4">
            <Button
              onClick={onCancelar}
              variant="secondary"
              disabled={loading}
              className="flex-1"
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs sm:text-sm">Cancelar (Esc)</span>
              </div>
            </Button>
            
            <Button
              onClick={() => onConfirmar(registro.id)}
              variant="danger"
              disabled={!confirmarHabilitado()}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span className="text-xs sm:text-sm">Eliminando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-xs sm:text-sm">Sí, Eliminar Permanentemente</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Pie de página informativo */}
        <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
              💡 Presione <kbd className="px-1 sm:px-2 py-0.5 sm:py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> para cancelar
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right">
              Acción registrada en bitácora del sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}