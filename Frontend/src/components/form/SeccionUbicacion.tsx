// components/form/SeccionUbicacion.tsx
import { useState, useEffect, useMemo } from 'react';
import Input from '../../components/common/Input';
import SectionTitle from '../../components/common/SectionTitle';
import Combobox from '../../components/common/Combobox';
import type { CentroCosto, SubArea, Area, Procedencia, Sede } from '../../services/catalogo.service';

type SeccionUbicacionProps = {
  centroCostoId: number | null;
  subAreaNombre: string;
  areaNombre: string;
  procedenciaNombre: string;
  sedeNombre: string;
  onCentroCostoChange: (centroCostoId: number) => void;
  centrosCosto: CentroCosto[];
  // Añadir valores por defecto para todos los arrays
  subAreas?: SubArea[];
  areas?: Area[];
  procedencias?: Procedencia[];
  sedes?: Sede[];
  disabled?: boolean;
};

export default function SeccionUbicacion({
  centroCostoId,
  subAreaNombre,
  areaNombre,
  procedenciaNombre,
  sedeNombre,
  onCentroCostoChange,
  centrosCosto = [], // Valor por defecto
  subAreas = [], // Valor por defecto
  areas = [], // Valor por defecto
  procedencias = [], // Valor por defecto
  sedes = [], // Valor por defecto
  disabled = false
}: SeccionUbicacionProps) {
  const [subAreaIdSeleccionada, setSubAreaIdSeleccionada] = useState<number | null>(null);

  // Función segura para obtener la sede de una subárea
  const obtenerSedeDeSubArea = (subAreaId: number): string => {
    // Verificar que subAreas exista y sea un array
    if (!Array.isArray(subAreas) || subAreas.length === 0) return '';
    
    const subArea = subAreas.find(sa => sa.id === subAreaId);
    if (!subArea) return '';
    
    // Verificar que areas exista y sea un array
    if (!Array.isArray(areas) || areas.length === 0) return '';
    
    const area = areas.find(a => a.id === subArea.area_id);
    if (!area) return '';
    
    // Verificar que procedencias exista y sea un array
    if (!Array.isArray(procedencias) || procedencias.length === 0) return '';
    
    const procedencia = procedencias.find(p => p.id === area.procedencia_id);
    if (!procedencia) return '';
    
    // Verificar que sedes exista y sea un array
    if (!Array.isArray(sedes) || sedes.length === 0) return '';
    
    const sede = sedes.find(s => s.id === procedencia.sede_id);
    return sede?.nombre || '';
  };

  // Obtener subáreas únicas para el combobox con información de sede
  const subAreasOptions = useMemo(() => {
    // Verificar que los arrays existan
    if (!Array.isArray(centrosCosto)) return [];
    if (!Array.isArray(subAreas)) return [];
    
    // Obtener IDs de subáreas únicas de los centros de costo
    const subAreaIdsUnicas = Array.from(
      new Set(centrosCosto
        .map(cc => cc.subarea_id)
        .filter((id): id is number => id !== null && id !== undefined && !isNaN(id))
      )
    );
    
    // Mapear IDs a objetos con nombre y sede
    return subAreaIdsUnicas.map(id => {
      const subArea = subAreas.find(sa => sa.id === id);
      if (!subArea) return null;
      
      const sede = obtenerSedeDeSubArea(id);
      const label = sede 
        ? `${subArea.nombre} - ${sede}`
        : subArea.nombre;
      
      return {
        value: String(id),
        label: label,
        subAreaNombre: subArea.nombre,
        sedeNombre: sede
      };
    })
    .filter(option => option !== null)
    .sort((a, b) => a!.label.localeCompare(b!.label));
  }, [centrosCosto, subAreas, areas, procedencias, sedes]);

  // Filtrar centros por subárea seleccionada
  const centrosPorSubArea = useMemo(() => {
    if (!subAreaIdSeleccionada) return [];
    if (!Array.isArray(centrosCosto)) return [];
    
    return centrosCosto.filter(centro => centro.subarea_id === subAreaIdSeleccionada);
  }, [centrosCosto, subAreaIdSeleccionada]);

  // Función para obtener la sede de un centro de costo
  const obtenerSedeDeCentroCosto = (centro: CentroCosto): string => {
    if (!centro.subarea_id) return '';
    return obtenerSedeDeSubArea(centro.subarea_id);
  };

  // Opciones para centros de costo con sede
  const centrosOptions = useMemo(() => {
    if (!Array.isArray(centrosPorSubArea)) return [];
    
    return centrosPorSubArea.map(centro => {
      const sede = obtenerSedeDeCentroCosto(centro);
      const labelSede = sede ? ` (${sede})` : '';
      
      return {
        value: String(centro.id),
        label: `${centro.codigo}${centro.nombre ? ` - ${centro.nombre}` : ''}${labelSede}`
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [centrosPorSubArea, subAreas, areas, procedencias, sedes]);

  // Encontrar el centro de costo actual
  const centroCostoActual = useMemo(() => {
    if (!Array.isArray(centrosCosto)) return undefined;
    return centrosCosto.find(cc => cc.id === centroCostoId);
  }, [centrosCosto, centroCostoId]);

  // Obtener información relacionada del centro actual
  const obtenerInfoRelacionada = () => {
    if (!centroCostoActual) {
      return {
        subAreaNombre,
        areaNombre,
        procedenciaNombre,
        sedeNombre
      };
    }

    // Verificar que subAreas sea un array
    if (!Array.isArray(subAreas)) {
      return {
        subAreaNombre: subAreaNombre,
        areaNombre: areaNombre,
        procedenciaNombre: procedenciaNombre,
        sedeNombre: sedeNombre
      };
    }

    const subArea = subAreas.find(sa => sa.id === centroCostoActual.subarea_id);
    if (!subArea) {
      return {
        subAreaNombre: subAreaNombre,
        areaNombre: areaNombre,
        procedenciaNombre: procedenciaNombre,
        sedeNombre: sedeNombre
      };
    }

    // Verificar que areas sea un array
    if (!Array.isArray(areas)) {
      return {
        subAreaNombre: subArea.nombre,
        areaNombre: areaNombre,
        procedenciaNombre: procedenciaNombre,
        sedeNombre: sedeNombre
      };
    }

    const area = areas.find(a => a.id === subArea.area_id);
    
    let procedenciaNombreActual = procedenciaNombre;
    let sedeNombreActual = sedeNombre;
    
    if (area) {
      // Verificar que procedencias sea un array
      if (Array.isArray(procedencias)) {
        const procedencia = procedencias.find(p => p.id === area.procedencia_id);
        if (procedencia) {
          procedenciaNombreActual = procedencia.nombre;
          
          // Verificar que sedes sea un array
          if (Array.isArray(sedes)) {
            const sede = sedes.find(s => s.id === procedencia.sede_id);
            if (sede) {
              sedeNombreActual = sede.nombre;
            }
          }
        }
      }
    }

    return {
      subAreaNombre: subArea.nombre,
      areaNombre: area?.nombre || areaNombre,
      procedenciaNombre: procedenciaNombreActual,
      sedeNombre: sedeNombreActual
    };
  };

  const infoActual = obtenerInfoRelacionada();

  // Sincronizar cuando cambia el centro externamente
  useEffect(() => {
    if (centroCostoActual?.subarea_id && centroCostoActual.subarea_id !== subAreaIdSeleccionada) {
      const subAreaId = centroCostoActual.subarea_id;
      if (subAreaId !== null && subAreaId !== undefined) {
        setSubAreaIdSeleccionada(subAreaId);
      }
    }
  }, [centroCostoActual, subAreaIdSeleccionada]);

  const handleSubAreaChange = (subAreaIdStr: string) => {
    const subAreaId = parseInt(subAreaIdStr);
    if (isNaN(subAreaId)) return;
    
    setSubAreaIdSeleccionada(subAreaId);
    
    // Seleccionar el primer centro de costo de esta subárea
    const centrosEnSubArea = centrosCosto.filter(cc => cc.subarea_id === subAreaId);
    if (centrosEnSubArea.length > 0) {
      onCentroCostoChange(centrosEnSubArea[0].id);
    }
  };

  const handleCentroCostoChange = (centroCostoIdStr: string) => {
    const id = parseInt(centroCostoIdStr);
    if (!isNaN(id)) {
      onCentroCostoChange(id);
    }
  };

  return (
    <div>
      <SectionTitle>Ubicación organizacional</SectionTitle>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sub Área con sede */}
        <Combobox
          label="Area"
          value={subAreaIdSeleccionada ? String(subAreaIdSeleccionada) : ""}
          onChange={handleSubAreaChange}
          options={subAreasOptions}
          disabled={disabled}
          placeholder="Seleccione Area"
        />

        {/* Centro de Costos con sede */}
        <Combobox
          label="Centro de Costos"
          value={centroCostoId ? String(centroCostoId) : ""}
          onChange={handleCentroCostoChange}
          options={centrosOptions}
          disabled={disabled || !subAreaIdSeleccionada}
          placeholder={subAreaIdSeleccionada ? 
            `Seleccione centro de costos (${centrosPorSubArea.length} disponibles)` : 
            "Primero seleccione Area"
          }
        />

        {/* Campos de información */}
        <Input
          label="Procedencia"
          value={infoActual.procedenciaNombre}
          onChange={() => {}}
          disabled
        />

        <Input
          label="Sede"
          value={infoActual.sedeNombre}
          onChange={() => {}}
          disabled
        />
      </div>
    </div>
  );
}