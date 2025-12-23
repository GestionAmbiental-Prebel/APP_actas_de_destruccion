import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerActasCompletas } from '../../services/actas.service';
import { apiRequest } from "../../services/api.service";

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
};

export default function ConciliarActa() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [acta, setActa] = useState<any>(null);
  const [residuos, setResiduos] = useState<ResiduoConciliacion[]>([]);
  const [documentoConciliador, setDocumentoConciliador] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);

  useEffect(() => {
    cargarActa();
  }, [id]);

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

    console.log(
      "%c=== DEBUG RESIDUOS RECIBIDOS DEL BACKEND ===",
      "color: #ff9500; font-weight: bold; font-size: 14px;"
    );

    actaEncontrada.residuos.forEach((r: any, i: number) => {
      console.log(`→ Residuo #${i}`);
      console.log("   ID recibido:", r.acta_generacion_residuo_id);
      console.log("   Nombre:", r.residuo_nombre);
      console.log("   Peso reportado:", r.peso_reportado);
    });

    console.log("=== RESIDUOS DEL BACKEND ===", actaEncontrada.residuos);
    const residuosIniciales = actaEncontrada.residuos.map((r: any) => ({
      ...r,
      peso_conciliado: r.peso_reportado,
      tiene_novedad: false,
      descripcion_novedad: '',
      acta_generacion_residuo_id:  r.acta_generacion_residuo_id,
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
    setResiduos(nuevosResiduos);
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
    alert('Por favor, ingrese un documento válido');
    return;
  }

  const residuosConNovedadSinDescripcion = residuos.filter(
    r => r.tiene_novedad && !r.descripcion_novedad.trim()
  );

  if (residuosConNovedadSinDescripcion.length > 0) {
    alert('Por favor, describa todas las novedades marcadas');
    return;
  }

  try {
    setEnviando(true);

    // Construcción del payload
    const payload = {
      documento_recepcion: documentoConciliador,
      residuos: residuos.map((r, index) => {
        console.log(
          `%c⌗ DEBUG RESIDUO ${index}:`,
          "color: #0a84ff; font-weight: bold;"
        );
        console.log(" - ID enviado:", r.acta_generacion_residuo_id);
        console.log(" - Peso conciliado:", r.peso_conciliado);
        console.log(" - Descripción novedad:", r.descripcion_novedad);

        if (!r.acta_generacion_residuo_id) {
          console.warn(
            `%c⚠️ RESIDUO SIN ID EN POSICIÓN ${index}`,
            "color: #ff3b30; font-weight: bold;"
          );
        }

        return {
          id: r.acta_generacion_residuo_id,
          peso_conciliado: parseFloat(r.peso_conciliado),
          descripcion_novedad: r.tiene_novedad ? r.descripcion_novedad : undefined,
        };
      }),
    };

    console.log(
      "%c=== PAYLOAD FINAL ===",
      "color: #34c759; font-size: 16px; font-weight: bold;"
    );
    console.log(JSON.stringify(payload, null, 2));

    // Enviar al backend
    await apiRequest(`/conciliacion/${id}/conciliar/`, {
      method: "POST",
      body: payload,
    });

    setMostrarExito(true);
    setTimeout(() => {
      navigate('/operario-punto-verde/conciliadas');
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

              {/* NUEVO: Subárea */}
              {acta.subarea && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Subárea</p>
                  <p className="font-semibold">{acta.subarea}</p>
                </div>
              )}

              {/* NUEVO: Código del centro de costos */}
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
          <div className="max-w-md">
            <Input
              label="Documento de Identidad"
              value={documentoConciliador}
              onChange={setDocumentoConciliador}
              type="text"
              inputMode="numeric"
              validation={(value) => value.replace(/[^0-9]/g, '')}
              maxLength={10}
              required
              placeholder="Ingrese su cédula"
            />
          </div>
        </div>

        {/* Residuos a Conciliar */}
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

                  {residuo.tiene_novedad && (
                    <div className="md:col-span-2">
                      <label className="block font-medium mb-1">
                        Descripción de la novedad *
                      </label>
                      <textarea
                        value={residuo.descripcion_novedad}
                        onChange={(e) => handleResiduoChange(index, 'descripcion_novedad', e.target.value)}
                        required={residuo.tiene_novedad}
                        rows={3}
                        maxLength={200}
                        placeholder="Describa la novedad encontrada (máx. 200 caracteres)"
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

        {/* Botones */}
        <div className="flex gap-4 justify-end sticky bottom-0 bg-white dark:bg-gray-900 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/operario-punto-verde/actas')}
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
