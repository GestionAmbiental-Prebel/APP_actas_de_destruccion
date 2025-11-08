import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import SectionTitle from '../../components/common/SectionTitle';
import type { CentroCosto } from '../../services/catalogo.service';

type SeccionUbicacionProps = {
  // Valores actuales
  centroCostoId: number | null;
  subAreaNombre: string;
  areaNombre: string;
  procedenciaNombre: string;
  sedeNombre: string;
  
  // Handlers
  onCentroCostoChange: (centroCostoId: number) => void;
  
  // Catálogos desde el backend
  centrosCosto: CentroCosto[];
  
  // Disabled state
  disabled?: boolean;
};

export default function SeccionUbicacion({
  centroCostoId,
  subAreaNombre,
  areaNombre,
  procedenciaNombre,
  sedeNombre,
  onCentroCostoChange,
  centrosCosto,
  disabled = false
}: SeccionUbicacionProps) {
  
  // Preparar opciones de centros de costo
  const centrosOptions = centrosCosto.map(cc => ({
    value: String(cc.id),
    label: `${cc.codigo}${cc.nombre ? ` - ${cc.nombre}` : ''}`
  }));

  return (
    <div>
      <SectionTitle>Ubicación organizacional</SectionTitle>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Centro de Costos */}
        <Select
          label="Centro de Costos"
          value={centroCostoId ? String(centroCostoId) : ''}
          onChange={(value) => onCentroCostoChange(parseInt(value))}
          options={centrosOptions}
          required
          disabled={disabled}
          placeholder="Seleccione centro de costos"
        />

        {/* Sub Área (autocompletado) */}
        <Input
          label="Sub Área"
          value={subAreaNombre}
          onChange={() => {}}
          disabled
        />

        {/* Área (autocompletado) */}
        <Input
          label="Área"
          value={areaNombre}
          onChange={() => {}}
          disabled
        />

        {/* Procedencia (autocompletado) */}
        <Input
          label="Procedencia"
          value={procedenciaNombre}
          onChange={() => {}}
          disabled
        />

        {/* Sede (autocompletado) */}
        <Input
          label="Sede"
          value={sedeNombre}
          onChange={() => {}}
          disabled
        />
      </div>
    </div>
  );
}