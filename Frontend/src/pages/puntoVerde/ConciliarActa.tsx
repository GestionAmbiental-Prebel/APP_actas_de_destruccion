// ConciliarActa.tsx - VERSIÓN SIMPLIFICADA CON ID FIJO
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerActasCompletas } from '../../services/actas.service';
import { apiRequest } from "../../services/api.service";
import { obtenerOperarios } from '../../services/operarios.service';
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
  tipo_novedad?: string;
};

const TIPOS_NOVEDAD = [
  { value: 'diferencia_peso', label: 'Diferencia de peso' },
  { value: 'diferencia_material', label: 'Diferencia nombre material' },
  { value: 'otro', label: 'Otro (especificar)' },
];

// ID FIJO DE LA SUBÁREA PUNTO VERDE
const ID_SUBAREA_PUNTO_VERDE = 69;

export default function ConciliarActa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [acta, setActa] = useState<any>(null);
  const [residuos, setResiduos] = useState<ResiduoConciliacion[]>([]);
  const [documentoConciliador, setDocumentoConciliador] = useState('');
  const [nombreConciliador, setNombreConciliador] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [operariosMap, setOperariosMap] = useState<Record<string, string>>({});
  const [operariosPuntoVerde, setOperariosPuntoVerde] = useState<any[]>([]);
  const [cargandoOperarios, setCargandoOperarios] = useState(false);

  useEffect(() => {
    cargarOperarios();
    cargarActa();
  }, [id]);

  const cargarOperarios = async () => {
    try {
      setCargandoOperarios(true);
      const data = await obtenerOperarios();
      
      // Filtrar operarios que pertenecen específicamente a la subárea Punto Verde (ID 69)
      const operariosPuntoVerdeFiltrados = data.filter((op: any) => 
        op.subarea_id === ID_SUBAREA_PUNTO_VERDE
      );
      
      setOperariosPuntoVerde(operariosPuntoVerdeFiltrados);
      
      // Crear mapa solo con operarios de Punto Verde
      const map: Record<string, string> = {};
      operariosPuntoVerdeFiltrados.forEach((op: any) => {
        const documento = op.documento || '';
        if (documento) {
          const nombreCompleto = `${op.nombre || ''} ${op.apellido || ''}`.trim();
          if (nombreCompleto) {
            map[documento] = nombreCompleto;
          }
        }
      });
      setOperariosMap(map);
      
      console.log('Operarios de Punto Verde cargados:', operariosPuntoVerdeFiltrados.length);
      console.log('IDs de documentos autorizados:', Object.keys(map));
      
    } catch (err) {
      console.error('Error cargando operarios:', err);
    } finally {
      setCargandoOperarios(false);
    }
  };

  useEffect(() => {
    if (documentoConciliador && operariosMap[documentoConciliador]) {
      setNombreConciliador(operariosMap[documentoConciliador]);
    } else {
      setNombreConciliador('');
    }
  }, [documentoConciliador, operariosMap]);

  // Función mejorada para obtener información del residuo
  const obtenerInfoResiduo = (residuo: ResiduoConciliacion) => {
    const nombreResiduo = residuo.residuo_nombre?.toLowerCase() || '';
    const esPeligroso = nombreResiduo.includes('peligroso');
    const esOtroResiduo = nombreResiduo.includes('otro residuo') && !esPeligroso;
    const esOtroGenerico = nombreResiduo === 'otro';
    const esMEConMarca = nombreResiduo.includes('me con marca') || nombreResiduo.includes('me - con marca');
    const esMESinMarca = nombreResiduo.includes('me sin marca') || nombreResiduo.includes('me - sin marca');
    
    // Determinar el tipo específico de residuo
    let tipoEspecifico = '';
    if (esPeligroso) {
      tipoEspecifico = 'Peligroso';
    } else if (esMEConMarca) {
      tipoEspecifico = 'ME - Con marca';
    } else if (esMESinMarca) {
      tipoEspecifico = 'ME - Sin marca';
    } else if (esOtroResiduo) {
      tipoEspecifico = 'Otro residuo';
    } else if (esOtroGenerico) {
      tipoEspecifico = 'Otro';
    }
    
    return {
      nombreBase: residuo.residuo_nombre,
      especificacion: residuo.residuo_otro,
      esPeligroso,
      esOtroResiduo,
      esOtroGenerico,
      esMEConMarca,
      esMESinMarca,
      tipoEspecifico,
      tieneEspecificacion: !!residuo.residuo_otro && residuo.residuo_otro.trim() !== '',
      categoria: residuo.categoria_nombre
    };
  };

  // Función para mostrar el nombre completo del residuo
  const obtenerNombreResiduoCompleto = (residuo: ResiduoConciliacion) => {
    const info = obtenerInfoResiduo(residuo);
    
    // Si tiene especificación, mostrar el tipo específico como subtítulo
    if (info.tieneEspecificacion) {
      return `${info.nombreBase}`;
    }
    
    // Para residuos normales
    return info.nombreBase;
  };

  // Función para mostrar el detalle del residuo
  const obtenerDetalleResiduo = (residuo: ResiduoConciliacion) => {
    const info = obtenerInfoResiduo(residuo);
    
    if (info.tieneEspecificacion) {
      return info.especificacion;
    }
    
    return null;
  };

  // Función para mostrar el tipo específico del residuo
  const obtenerTipoResiduo = (residuo: ResiduoConciliacion) => {
    const info = obtenerInfoResiduo(residuo);
    return info.tipoEspecifico;
  };

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

      const residuosIniciales = actaEncontrada.residuos.map((r: any) => ({
        ...r,
        peso_conciliado: r.peso_reportado,
        tiene_novedad: false,
        descripcion_novedad: '',
        tipo_novedad: '',
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
    
    if (field === 'tipo_novedad' && value !== 'otro') {
      nuevosResiduos[index].descripcion_novedad = '';
    }
    
    if (field === 'tiene_novedad' && value === false) {
      nuevosResiduos[index].tipo_novedad = '';
      nuevosResiduos[index].descripcion_novedad = '';
    }
    
    setResiduos(nuevosResiduos);
  };

  const handleDocumentoChange = (value: string) => {
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

    // VERIFICAR SI EL DOCUMENTO EXISTE EN LA BASE DE DATOS Y ES OPERARIO DE PUNTO VERDE
    if (!operariosMap[documentoConciliador]) {
      alert('❌ Solo el personal de Punto Verde puede conciliar actas. \n\n' +
            'Verifique que:\n' +
            '1. Su documento esté registrado\n' +
            '2. Pertenezca a la subárea "Punto Verde"\n' +
            '3. Contacte al coordinador si necesita acceso');
      return;
    }

    const residuosConNovedadSinCompletar = residuos.filter(r => {
      if (!r.tiene_novedad) return false;
      if (!r.tipo_novedad) return true;
      if (r.tipo_novedad === 'otro' && !r.descripcion_novedad.trim()) return true;
      return false;
    });

    if (residuosConNovedadSinCompletar.length > 0) {
      alert('Por favor, complete todos los campos de novedad marcados');
      return;
    }

    try {
      setEnviando(true);

      const payload = {
        documento_recepcion: documentoConciliador,
        residuos: residuos.map((r) => {
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

  // Determinar si el botón de enviar debe estar deshabilitado
  const documentoValido = documentoConciliador.length >= 6;
  const esOperarioPuntoVerde = operariosMap[documentoConciliador];
  const puedeConciliar = documentoValido && esOperarioPuntoVerde;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-skyBlue dark:text-lightBlue">
        Conciliar Acta
      </h1>

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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <p className="text-gray-500 dark:text-gray-400">N° Inventario</p>
                <p className="font-semibold">{acta.numero_inventario}</p>
              </div>
            )}

            {acta.subarea && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Área</p>
                <p className="font-semibold">{acta.subarea}</p>
              </div>
            )}

            {acta.sede && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Sede</p>
                <p className="font-semibold">{acta.sede}</p>
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

        {/* Documento del Conciliador */}
        <div>
          <SectionTitle>Datos del Conciliador</SectionTitle>
          <div className="max-w-md space-y-4">
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                ⓘ Acceso restringido
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Solo el personal registrado en el área <strong>Punto Verde</strong> puede conciliar actas.
              </p>
            </div>
            
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
            
            {nombreConciliador && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  ✅ Operario de Punto Verde encontrado:
                </p>
                <p className="font-semibold text-green-700 dark:text-green-400">
                  {nombreConciliador}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Subárea autorizada: Punto Verde (ID: {ID_SUBAREA_PUNTO_VERDE})
                </p>
              </div>
            )}
            
            {documentoConciliador.length >= 6 && !nombreConciliador && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  ❌ Acceso denegado
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Solo el personal de <strong>Punto Verde</strong> puede conciliar actas. 
                  Verifique su documento o contacte al coordinador.
                </p>
              </div>
            )}
            
          </div>
        </div>

        {/* Residuos a Conciliar - TABLA MEJORADA */}
        <div>
          <SectionTitle>Conciliación de Residuos</SectionTitle>

          <div className="space-y-4">
            {residuos.map((residuo, index) => {
              const detalle = obtenerDetalleResiduo(residuo);
              const tipoResiduo = obtenerTipoResiduo(residuo);
              const infoResiduo = obtenerInfoResiduo(residuo);
              
              return (
                <div 
                  key={index} 
                  className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">
                            {obtenerNombreResiduoCompleto(residuo)}
                          </h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mt-1">
                            {/* Tipo específico */}
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {residuo.categoria_nombre}
                              </span>
                              {tipoResiduo && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                  {tipoResiduo}
                                </span>
                              )}
                            </div>
                            
                            {/* Especificación si existe */}
                            {detalle && (
                              <div className="text-gray-700 dark:text-gray-300 font-medium">
                                Especificación: {detalle}
                              </div>
                            )}
                            
                            {/* Motivo */}
                            <div>
                              Motivo: {residuo.motivo}
                              {residuo.motivo === 'Otro' && residuo.motivo_otro && ` - ${residuo.motivo_otro}`}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Badge si es peligroso */}
                      {infoResiduo.esPeligroso && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                            ⚠️ Residuo peligroso
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right min-w-[120px]">
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

                    {/* SECCIÓN DE NOVEDAD */}
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
              );
            })}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Conciliador (Punto Verde):</p>
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
            disabled={enviando || !puedeConciliar}
          >
            {enviando ? 'Guardando...' : '✓ Guardar Conciliación'}
          </Button>
        </div>
      </form>
    </div>
  );
}