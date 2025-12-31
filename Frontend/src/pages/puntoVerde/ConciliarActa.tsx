import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerActasCompletas } from '../../services/actas.service';
import { apiRequest } from "../../services/api.service";
import { obtenerOperarios } from '../../services/operarios.service'; // ← Añadir

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SectionTitle from '../../components/common/SectionTitle';

type ResiduoConciliacion = {
  acta_generacion_residuo_id: number;
  residuo_nombre: string;
  residuo_otro?: string | null;
  categoria_nombre: string;
  motivo: string;
  motivo_otro?: string | null;
  peso_reportado: string;
  peso_conciliado: string;
  tiene_novedad: boolean;
  descripcion_novedad: string;
  tipo_novedad?: string; // ← Nuevo campo para tipo de novedad
};

// Tipos de novedad comunes
const TIPOS_NOVEDAD = [
  { value: 'diferencia_peso', label: 'Diferencia de peso' },
  { value: 'diferencia_material', label: 'Diferencia nombre material' },
  { value: 'otro', label: 'Otro (especificar)' },
];

export default function ConciliarActa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [acta, setActa] = useState<any>(null);
  const [residuos, setResiduos] = useState<ResiduoConciliacion[]>([]);
  const [documentoConciliador, setDocumentoConciliador] = useState('');
  const [nombreConciliador, setNombreConciliador] = useState(''); // ← Nuevo estado
  
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  
  // Estado para operarios (para autocompletar nombre)
  const [operariosMap, setOperariosMap] = useState<Record<string, string>>({});
  const [cargandoOperarios, setCargandoOperarios] = useState(false);

  useEffect(() => {
    cargarOperarios(); // Cargar operarios al montar
    cargarActa();
  }, [id]);

  // Cargar lista de operarios para autocompletar
  const cargarOperarios = async () => {
    try {
      setCargandoOperarios(true);
      const data = await obtenerOperarios();
      
      const map: Record<string, string> = {};
      data.forEach((op: any) => {
        const documento = op.documento || '';
        if (documento) {
          const nombre = op.nombre || '';
          const apellido = op.apellido || '';
          const nombreCompleto = `${nombre} ${apellido}`.trim();
          if (nombreCompleto) {
            map[documento] = nombreCompleto;
          }
        }
      });
      
      setOperariosMap(map);
      console.log(`✅ Mapa de operarios creado con ${Object.keys(map).length} registros`);
    } catch (err) {
      console.error('Error cargando operarios:', err);
    } finally {
      setCargandoOperarios(false);
    }
  };

  // Buscar nombre cuando cambie el documento
  useEffect(() => {
    if (documentoConciliador && operariosMap[documentoConciliador]) {
      setNombreConciliador(operariosMap[documentoConciliador]);
    } else {
      setNombreConciliador('');
    }
  }, [documentoConciliador, operariosMap]);

  const cargarActa = async () => {
    try {
      setLoading(true);
      const actas = await obtenerActasCompletas();
      const actaEncontrada = actas.find((a: any) => a.id === parseInt(id!));

      if (!actaEncontrada) {
        alert('Acta no encontrada');
        navigate('/punto-verde/actas');
        return;
      }

      setActa(actaEncontrada);

      console.log("=== RESIDUOS DEL BACKEND ===", actaEncontrada.residuos);
      const residuosIniciales = actaEncontrada.residuos.map((r: any) => ({
        ...r,
        peso_conciliado: r.peso_reportado,
        tiene_novedad: false,
        descripcion_novedad: '',
        tipo_novedad: '', // ← Inicializar tipo de novedad
        acta_generacion_residuo_id: r.acta_generacion_residuo_id,
      }));

      setResiduos(residuosIniciales);

    } catch (error) {
      console.error('Error cargando acta:', error);
      alert('Error al cargar el acta');
    } finally {
      setLoading(false);
    }
  };

  const handleResiduoChange = (index: number, field: keyof ResiduoConciliacion, value: any) => {
    const nuevosResiduos = [...residuos];
    nuevosResiduos[index] = { ...nuevosResiduos[index], [field]: value };
    
    // Si el tipo de novedad es "otro", asegurarse de limpiar descripción si ya no es "otro"
    if (field === 'tipo_novedad' && value !== 'otro') {
      nuevosResiduos[index].descripcion_novedad = '';
    }
    
    // Si se desmarca la novedad, limpiar campos
    if (field === 'tiene_novedad' && value === false) {
      nuevosResiduos[index].tipo_novedad = '';
      nuevosResiduos[index].descripcion_novedad = '';
    }
    
    setResiduos(nuevosResiduos);
  };

  // Manejar cambio de documento con validación
  const handleDocumentoChange = (value: string) => {
    // Solo permitir números
    const soloNumeros = value.replace(/[^0-9]/g, '');
    setDocumentoConciliador(soloNumeros);
  };

  const calcularPesoTotal = (tipo: 'reportado' | 'conciliado'): number => {
    return residuos.reduce((total, r) => {
      const peso = parseFloat(tipo === 'reportado' ? r.peso_reportado : r.peso_conciliado) || 0;
      return total + peso;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentoConciliador || documentoConciliador.length < 6) {
      alert('Por favor, ingrese un documento válido (mínimo 6 dígitos)');
      return;
    }

    // Validar residuos con novedad
    const residuosConNovedadSinCompletar = residuos.filter(r => {
      if (!r.tiene_novedad) return false;
      
      // Si tiene novedad, debe tener tipo de novedad
      if (!r.tipo_novedad) return true;
      
      // Si el tipo es "otro", debe tener descripción
      if (r.tipo_novedad === 'otro' && !r.descripcion_novedad.trim()) return true;
      
      return false;
    });

    if (residuosConNovedadSinCompletar.length > 0) {
      alert('Por favor, complete todos los campos de novedad marcados');
      return;
    }

    try {
      setEnviando(true);

      // Construcción del payload con tipo de novedad
      const payload = {
        documento_recepcion: documentoConciliador,
        residuos: residuos.map((r, index) => {
          console.log(`⌗ DEBUG RESIDUO ${index}:`);
          console.log(" - ID enviado:", r.acta_generacion_residuo_id);
          console.log(" - Peso conciliado:", r.peso_conciliado);
          console.log(" - Tipo novedad:", r.tipo_novedad);
          console.log(" - Descripción novedad:", r.descripcion_novedad);

          if (!r.acta_generacion_residuo_id) {
            console.warn(`⚠️ RESIDUO SIN ID EN POSICIÓN ${index}`);
          }

          // Construir descripción de novedad combinada
          let descripcionCompleta = '';
          if (r.tiene_novedad && r.tipo_novedad) {
            const tipo = TIPOS_NOVEDAD.find(t => t.value === r.tipo_novedad)?.label || r.tipo_novedad;
            descripcionCompleta = tipo;
            
            if (r.tipo_novedad === 'otro' && r.descripcion_novedad) {
              descripcionCompleta = `${descripcionCompleta}: ${r.descripcion_novedad}`;
            } else if (r.descripcion_novedad) {
              descripcionCompleta = `${descripcionCompleta} - ${r.descripcion_novedad}`;
            }
          }

          return {
            id: r.acta_generacion_residuo_id,
            peso_conciliado: parseFloat(r.peso_conciliado),
            descripcion_novedad: r.tiene_novedad ? descripcionCompleta : undefined,
          };
        }),
      };

      console.log("=== PAYLOAD FINAL ===");
      console.log(JSON.stringify(payload, null, 2));

      // Enviar al backend
      await apiRequest(`/conciliacion/${id}/conciliar/`, {
        method: "POST",
        body: payload,
      });

      setMostrarExito(true);
      setTimeout(() => {
        navigate('/punto-verde/conciliadas'); 
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error conciliando:', error);
      alert(`Error conciliando: ${error.message || "Error desconocido"}`);
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-skyBlue mx-auto mb-4"></div>
          <p className="text-xl">Cargando acta...</p>
          {cargandoOperarios && <p className="text-sm text-gray-500 mt-2">Cargando información de operarios...</p>}
        </div>
      </div>
    );
  }

  if (!acta) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">Acta no encontrada</p>
      </div>
    );
  }

  const pesoTotalReportado = calcularPesoTotal('reportado');
  const pesoTotalConciliado = calcularPesoTotal('conciliado');
  const diferenciaPeso = pesoTotalConciliado - pesoTotalReportado;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-skyBlue dark:text-lightBlue">
        Conciliar Acta
      </h1>

      {/* Modal de éxito */}
      {mostrarExito && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">
                ¡Acta conciliada exitosamente!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Redirigiendo...
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Información del Acta */}
        <div className="bg-skyBlue/10 dark:bg-gray-800 p-6 rounded-lg">
          <SectionTitle>Información del Acta</SectionTitle>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">N° Acta</p>
              <p className="font-bold text-lg">{acta.numero_acta}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Fecha</p>
              <p className="font-semibold">
                {new Date(acta.fecha_acta).toLocaleDateString('es-CO')}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Operario</p>
              <p className="font-semibold">{acta.operario_nombre}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Cédula</p>
              <p className="font-semibold">{acta.operario_documento}</p>
            </div>
            {acta.consecutivo && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Consecutivo</p>
                <p className="font-semibold">{acta.consecutivo}</p>
              </div>
            )}

            {acta.numero_inventario && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Número de Inventario</p>
                <p className="font-semibold">{acta.numero_inventario}</p>
              </div>
            )}

            {acta.subarea && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Subárea</p>
                <p className="font-semibold">{acta.subarea}</p>
              </div>
            )}

            {acta.centro_costo_codigo && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Centro de Costo</p>
                <p className="font-semibold">{acta.centro_costo_codigo}</p>
              </div>
            )}

            <div>
              <p className="text-gray-500 dark:text-gray-400">Peso Reportado</p>
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {pesoTotalReportado.toFixed(2)} kg
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Peso Conciliado</p>
              <p className="font-bold text-green-600 dark:text-green-400">
                {pesoTotalConciliado.toFixed(2)} kg
              </p>
            </div>
          </div>

          {diferenciaPeso !== 0 && (
            <div className={`mt-4 p-3 rounded ${
              diferenciaPeso > 0 
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' 
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              <p className="font-semibold">
                ⚠️ Diferencia: {diferenciaPeso > 0 ? '+' : ''}{diferenciaPeso.toFixed(2)} kg
              </p>
            </div>
          )}
        </div>

        {/* Documento del Conciliador - MEJORADO */}
        <div>
          <SectionTitle>Datos del Conciliador</SectionTitle>
          <div className="max-w-md space-y-4">
            <Input
              label="Documento de Identidad"
              value={documentoConciliador}
              onChange={handleDocumentoChange}
              type="text"
              inputMode="numeric"
              maxLength={10}
              required
              placeholder="Ingrese su cédula"
            />
            
            {/* Mostrar nombre autocompletado */}
            {nombreConciliador && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Operario encontrado:
                </p>
                <p className="font-semibold text-green-700 dark:text-green-400">
                  {nombreConciliador}
                </p>
              </div>
            )}
            
            {documentoConciliador.length >= 6 && !nombreConciliador && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Documento no encontrado en el sistema. Verifique el número.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Residuos a Conciliar - MEJORADO */}
        <div>
          <SectionTitle>Conciliación de Residuos</SectionTitle>

          <div className="space-y-4">
            {residuos.map((residuo, index) => (
              <div 
                key={index} 
                className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                      {residuo.residuo_nombre === 'Otro' && residuo.residuo_otro
                        ? `Otro: ${residuo.residuo_otro}`
                        : residuo.residuo_nombre}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {residuo.categoria_nombre} • {residuo.motivo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Peso reportado</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {parseFloat(residuo.peso_reportado).toFixed(2)} kg
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Peso Conciliado (kg)"
                      value={residuo.peso_conciliado}
                      onChange={(value) => handleResiduoChange(index, 'peso_conciliado', value)}
                      type="number"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={residuo.tiene_novedad}
                        onChange={(e) => handleResiduoChange(index, 'tiene_novedad', e.target.checked)}
                        className="w-5 h-5 text-skyBlue border-gray-300 rounded focus:ring-skyBlue"
                      />
                      <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                        ¿Conciliado con novedad?
                      </span>
                    </label>
                  </div>

                  {/* SECCIÓN DE NOVEDAD MEJORADA */}
                  {residuo.tiene_novedad && (
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block font-medium mb-1">
                          Tipo de novedad *
                        </label>
                        <select
                          value={residuo.tipo_novedad || ''}
                          onChange={(e) => handleResiduoChange(index, 'tipo_novedad', e.target.value)}
                          required={residuo.tiene_novedad}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                                   focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue focus:outline-none"
                        >
                          <option value="">Seleccione un tipo de novedad</option>
                          {TIPOS_NOVEDAD.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Campo de descripción adicional */}
                      {(residuo.tipo_novedad === 'otro' || 
                        (residuo.tipo_novedad && residuo.tipo_novedad !== '')) && (
                        <div>
                          <label className="block font-medium mb-1">
                            {residuo.tipo_novedad === 'otro' 
                              ? 'Descripción de la novedad *' 
                              : 'Detalles adicionales (opcional)'}
                          </label>
                          <textarea
                            value={residuo.descripcion_novedad}
                            onChange={(e) => handleResiduoChange(index, 'descripcion_novedad', e.target.value)}
                            required={residuo.tipo_novedad === 'otro'}
                            rows={residuo.tipo_novedad === 'otro' ? 3 : 2}
                            maxLength={200}
                            placeholder={
                              residuo.tipo_novedad === 'otro'
                                ? "Describa la novedad encontrada..."
                                : "Agregue detalles adicionales..."
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                                     focus:ring-2 focus:ring-skyBlue dark:focus:ring-lightBlue focus:outline-none"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                            {residuo.descripcion_novedad.length}/200
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {parseFloat(residuo.peso_conciliado) !== parseFloat(residuo.peso_reportado) && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Diferencia: {(parseFloat(residuo.peso_conciliado) - parseFloat(residuo.peso_reportado)).toFixed(2)} kg
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de novedades */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-3 text-gray-700 dark:text-gray-300">
            📋 Resumen de Conciliación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Residuos con novedad:</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {residuos.filter(r => r.tiene_novedad).length} / {residuos.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conciliador:</p>
              <p className="font-semibold">
                {nombreConciliador || 'Por confirmar'} ({documentoConciliador || 'Sin documento'})
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-end sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/punto-verde/conciliadas')}
            disabled={enviando} 
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={enviando}
          >
            {enviando ? 'Guardando...' : '✓ Guardar Conciliación'}
          </Button>
        </div>
      </form>
    </div>
  );
}