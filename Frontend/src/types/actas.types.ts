export type ResiduoEditable = {
  acta_generacion_residuo_id: number;
  residuo_nombre: string;
  residuo_id: number;
  motivo: string;
  descripcion_residuo_otro?: string;
  descripcion_motivo_otro?: string;
  peso_reportado: string;
  peso_conciliado: string;
  motivo_otro?: string | null;
  residuo_otro?: string | null;
  categoria_id?: number | null;
  generacion_residuo_id?: number;
};

export type ActaEditable = {
  subarea_id?: number;
  centro_costo_id?: number;
  consecutivo?: string | number | null;
  numero_inventario?: string | number | null;
  fecha_acta: string;
  operario_documento?: string;
  conciliador_documento?: string;
  residuos: ResiduoEditable[];
};