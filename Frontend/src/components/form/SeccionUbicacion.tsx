import Input from '../../components/common/Input';
import SectionTitle from '../../components/common/SectionTitle';
import Combobox from '../../components/common/Combobox';
import type { CentroCosto } from '../../services/catalogo.service';

type SeccionUbicacionProps = {
  centroCostoId: number | null;
  subAreaNombre: string;
  areaNombre: string;
  procedenciaNombre: string;
  sedeNombre: string;
  onCentroCostoChange: (centroCostoId: number) => void;
  centrosCosto: CentroCosto[];
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
  
  const centrosOptions = centrosCosto.map(cc => ({
    value: String(cc.id),
    label: `${cc.codigo}${cc.nombre ? ` - ${cc.nombre}` : ''}`
  }));

  return (
    <div>
      <SectionTitle>Ubicación organizacional</SectionTitle>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Centro de Costos */}
        <Combobox
          label="Centro de Costos"
          value={centroCostoId ? String(centroCostoId) : ""}
          onChange={(v) => onCentroCostoChange(parseInt(v))}
          options={centrosOptions}
          disabled={disabled}
          placeholder="Seleccione centro de costos"
        />

        {/* Sub Área */}
        <Input
          label="Sub Área"
          value={subAreaNombre}
          onChange={() => {}}
          disabled
        />

        {/* Área */}
        <Input
          label="Área"
          value={areaNombre}
          onChange={() => {}}
          disabled
        />

        {/* Procedencia */}
        <Input
          label="Procedencia"
          value={procedenciaNombre}
          onChange={() => {}}
          disabled
        />

        {/* Sede */}
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
