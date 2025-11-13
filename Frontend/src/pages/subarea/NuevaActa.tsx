import { useState, useEffect } from 'react';
import SeccionIdentificacion from '../../components/form/SeccionIdentificacion';
import SeccionUbicacion from '../../components/form/SeccionUbicacion';
import SeccionResiduos from '../../components/form/SeccionResiduos';
import Button from '../../components/common/Button';
import useCatalogos from '../../hooks/useCatalogos';
import useOperario from '../../hooks/use.Operario';
import { crearActaCompleta } from '../../services/actas.service';
import { obtenerOCrearOperario } from '../../services/operarios.service';

type Residuo = {
  residuo_id: number | null;
  categoria_id: number | null;
  motivo: string;
  motivo_otro?: string;
  peso: string;
};

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
  const motivos = [
    'Bloqueado',
    'Obsoleto',
    'Rechazado',
    'Vencido',
    'Otro'
  ];

  // Estado del envío
  const [enviando, setEnviando] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [numeroActaGenerado, setNumeroActaGenerado] = useState('');

  // ===== EFECTOS =====

  // Autocompletar nombre y apellido cuando se encuentra el operario
  useEffect(() => {
    if (operario) {
      setNombre(operario.nombre || '');
      setApellido(operario.apellido || '');
      
      // Si el operario tiene sub-área, autocompletar ubicación
      if (operario.subarea_id) {
        setSubAreaId(operario.subarea_id);
        autocompletarUbicacionDesdeSubArea(operario.subarea_id);
      }
    }
  }, [operario]);

  // ===== FUNCIONES AUXILIARES =====

  /**
   * Autocompleta toda la jerarquía de ubicación desde una sub-área
   */
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

  /**
   * Autocompleta toda la jerarquía desde un centro de costo
   */
  const autocompletarUbicacionDesdeCentroCosto = (centroCostoId: number) => {
    const centro = centrosCosto.find(cc => cc.id === centroCostoId);
    if (!centro || !centro.subarea_id) return;

    autocompletarUbicacionDesdeSubArea(centro.subarea_id);
  };

  /**
   * Filtra residuos por sub-área
   */
  const obtenerResiduosFiltrados = () => {
  console.log('subAreaId:', subAreaId); // ✅ Debug
  console.log('categoriasResiduos:', categoriasResiduos); // ✅ Debug
  
  if (!subAreaId) return [];

  // Obtener categorías de la sub-área actual
  const categoriasDeSubArea = categoriasResiduos.filter(
    cat => cat.subarea_id === subAreaId
  );
  
  console.log('categoriasDeSubArea:', categoriasDeSubArea); // ✅ Debug

  // Obtener residuos de esas categorías
  const categoriaIds = categoriasDeSubArea.map(cat => cat.id);
  const residuosFiltrados = residuosEspecificos.filter(res => 
    categoriaIds.includes(res.categoria_id)
  );
  
  console.log('residuosFiltrados:', residuosFiltrados); // ✅ Debug
  
  return residuosFiltrados;
};

  /**
   * Filtra categorías por sub-área
   */
  const obtenerCategoriasFiltradas = () => {
    if (!subAreaId) return [];
    return categoriasResiduos.filter(cat => cat.subarea_id === subAreaId);
  };

  /**
   * Obtiene nombres para mostrar
   */
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

  // ===== HANDLERS =====

  const handleCedulaBlur = () => {
    if (cedula.length >= 6) {
      buscarPorCedula(cedula);
    }
  };

  const handleCentroCostoChange = (centroCostoId: number) => {
    setCentroCostoId(centroCostoId);
    autocompletarUbicacionDesdeCentroCosto(centroCostoId);
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!centroCostoId || !subAreaId) {
    alert('Por favor, seleccione un centro de costo');
    return;
  }

  try {
    setEnviando(true);

    console.log('=== DATOS A ENVIAR ===');
    console.log('Cedula:', cedula);
    console.log('Nombre:', nombre);
    console.log('Apellido:', apellido);
    console.log('SubArea ID:', subAreaId);
    console.log('Centro Costo ID:', centroCostoId);
    console.log('Residuos:', residuos);

    // 1. Obtener o crear el operario
    console.log('1. Creando/obteniendo operario...');
    const operarioCreado = await obtenerOCrearOperario(
      cedula,
      nombre,
      apellido,
      subAreaId
    );
    console.log('Operario creado/obtenido:', operarioCreado);

    // 2. Preparar datos de residuos
    const residuosValidos = residuos.filter(r => 
      r.residuo_id && r.categoria_id && r.motivo && r.peso
    );

    if (residuosValidos.length === 0) {
      alert('Por favor, agregue al menos un residuo completo');
      setEnviando(false);
      return;
    }

    const residuosParaEnviar = residuosValidos.map(r => ({
      residuo_id: r.residuo_id!,
      peso: r.peso,
      motivo: r.motivo,
      motivo_otro: r.motivo === 'Otro' ? r.motivo_otro || '' : null, 
    }));
    console.log('Residuos a enviar:', residuosParaEnviar);

    // 3. Crear el acta completa
    console.log('3. Creando acta completa...');
    const resultado = await crearActaCompleta({
      cedula,
      nombre,
      apellido,
      subarea_id: subAreaId,
      centro_costo_id: centroCostoId,
      residuos: residuosParaEnviar,
      operario_id: operarioCreado.id
    });

    console.log('Resultado:', resultado);

    // 4. Mostrar mensaje de éxito
    setNumeroActaGenerado(resultado.numeroActa);
    setMostrarExito(true);

    setTimeout(() => {
      resetearFormulario();
      setMostrarExito(false);
    }, 5000);

  } catch (error: any) {
    console.error('=== ERROR COMPLETO ===');
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
    
    alert(`Error al crear el acta:\n${error.message || 'Error desconocido'}\n\nRevisa la consola para más detalles.`);
  } finally {
    setEnviando(false);
  }
};

  const resetearFormulario = () => {
    setCedula('');
    setNombre('');
    setApellido('');
    setCentroCostoId(null);
    setSubAreaId(null);
    setAreaId(null);
    setProcedenciaId(null);
    setSedeId(null);
    setResiduos([{ residuo_id: null, categoria_id: null, motivo: '', peso: '' }]);
    limpiar();
  };

  // ===== RENDER =====

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-skyBlue mx-auto mb-4"></div>
          <p className="text-xl">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      </div>
    );
  }

  const nombres = obtenerNombres();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-skyBlue dark:text-lightBlue">
        Nueva Acta
      </h1>

      {/* Modal de éxito */}
      {mostrarExito && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2 text-green-600">
                ¡Acta creada exitosamente!
              </h2>
              <p className="text-lg mb-4">
                Número de acta generado:
              </p>
              <p className="text-3xl font-mono font-bold text-skyBlue">
                {numeroActaGenerado}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Sección Identificación */}
        <SeccionIdentificacion
          cedula={cedula}
          setCedula={setCedula}
          nombre={nombre}
          setNombre={setNombre}
          apellido={apellido}
          setApellido={setApellido}
          onCedulaBlur={handleCedulaBlur}
        />

        {buscando && (
          <p className="text-sm text-gray-500 italic">🔍 Buscando operario...</p>
        )}

        {operario && (
          <p className="text-sm text-green-600">✓ Operario encontrado</p>
        )}

        {/* Sección Ubicación */}
        <SeccionUbicacion
          centroCostoId={centroCostoId}
          subAreaNombre={nombres.subAreaNombre}
          areaNombre={nombres.areaNombre}
          procedenciaNombre={nombres.procedenciaNombre}
          sedeNombre={nombres.sedeNombre}
          onCentroCostoChange={handleCentroCostoChange}
          centrosCosto={centrosCosto}
        />

        {/* Sección Residuos */}
        <SeccionResiduos
          residuos={residuos}
          setResiduos={setResiduos}
          residuosDisponibles={obtenerResiduosFiltrados()}
          categoriasDisponibles={obtenerCategoriasFiltradas()}
          motivos={motivos}
        />

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={resetearFormulario}
            disabled={enviando}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Enviar Acta'}
          </Button>
        </div>
      </form>
    </div>
  );
}