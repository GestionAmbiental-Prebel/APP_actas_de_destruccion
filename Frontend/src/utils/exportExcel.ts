import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface TableOptions {
  sheetName?: string;
  showFilter?: boolean;
  autoSizeColumns?: boolean;
  dateFormat?: string;
}

export const exportToExcel = (
  data: any[], 
  fileName: string, 
  options: TableOptions = {}
) => {
  try {
    // Validar datos
    if (!data || data.length === 0) {
      alert("NO HAY DATOS PARA EXPORTAR");
      return;
    }

    if (!Array.isArray(data)) {
      throw new Error("LOS DATOS DEBEN SER UN ARRAY");
    }

    const {
      sheetName = "DATOS",
      showFilter = true,
      autoSizeColumns = true,
      dateFormat = "dd/mm/yyyy"
    } = options;

    // Preparar datos (formatear fechas si es necesario)
    const preparedData = data.map(item => {
      const formattedItem: any = { ...item };
      
      // Formatear fechas en las propiedades
      Object.keys(formattedItem).forEach(key => {
        const value = formattedItem[key];
        if (value instanceof Date) {
          formattedItem[key] = formatDate(value, dateFormat);
        } else if (typeof value === 'string' && isDateString(value)) {
          formattedItem[key] = formatDateString(value, dateFormat);
        }
      });
      
      return formattedItem;
    });

    // Crear hoja de cálculo
    const worksheet = XLSX.utils.json_to_sheet(preparedData);

    // Calcular rango de la tabla
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const lastRow = range.e.r;
    const lastCol = range.e.c;

    // Agregar filtros automáticos
    if (showFilter) {
      const tableRange = XLSX.utils.encode_range({ 
        s: { r: 0, c: 0 }, 
        e: { r: lastRow, c: lastCol } 
      });
      worksheet['!autofilter'] = { ref: tableRange };
    }

    // Ajustar automáticamente el ancho de columnas
    if (autoSizeColumns && preparedData.length > 0) {
      const columnWidths: number[] = [];
      const headers = Object.keys(preparedData[0]);
      
      // Ancho mínimo para encabezados
      headers.forEach((header, index) => {
        columnWidths[index] = Math.max(header.length + 2, 12);
      });

      // Ancho según contenido
      preparedData.forEach(row => {
        headers.forEach((header, index) => {
          const cellValue = String(row[header] || '');
          columnWidths[index] = Math.max(columnWidths[index], cellValue.length + 2);
        });
      });

      // Aplicar anchos de columna
      worksheet['!cols'] = columnWidths.map(width => ({
        wch: Math.min(width, 50),
      }));
    }

    // Crear libro
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Congelar paneles (fila de encabezado)
    worksheet['!views'] = [{
      state: 'frozen',
      xSplit: 0,
      ySplit: 1,
      topLeftCell: 'A2',
      activeCell: 'A2'
    }];

    // Agregar propiedades del libro
    workbook.Props = {
      Title: fileName.toUpperCase(),
      Author: "SISTEMA DE GESTIÓN AMBIENTAL",
      CreatedDate: new Date()
    };

    // Generar archivo Excel - SIN estilos
    const excelBuffer = XLSX.write(workbook, { 
      bookType: "xlsx", 
      type: "array"
    });

    const blob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });

    // Generar nombre con fecha
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const finalFileName = `${fileName.toUpperCase()}_${timestamp}.xlsx`;

    // Descargar
    saveAs(blob, finalFileName);

    console.log(`✅ EXPORTADO: ${finalFileName} (${preparedData.length} registros)`);

  } catch (error: any) {
    console.error("❌ ERROR AL EXPORTAR A EXCEL:", error?.message || error);
    alert("OCURRIÓ UN ERROR AL EXPORTAR LOS DATOS. POR FAVOR, INTENTE NUEVAMENTE.");
  }
};

// Funciones auxiliares para formato de fechas
const formatDate = (date: Date, format: string): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  switch (format.toLowerCase()) {
    case "dd/mm/yyyy":
      return `${day}/${month}/${year}`;
    case "mm/dd/yyyy":
      return `${month}/${day}/${year}`;
    case "yyyy-mm-dd":
      return `${year}-${month}-${day}`;
    default:
      return date.toLocaleDateString("es-CO");
  }
};

const isDateString = (value: string): boolean => {
  // Patrones de fecha comunes
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}/, // DD-MM-YYYY
  ];

  return datePatterns.some(pattern => pattern.test(value));
};

const formatDateString = (dateString: string, format: string): string => {
  try {
    let date: Date;
    
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const [year, month, day] = parts.map(Number);
        date = new Date(year, month - 1, day);
      } else {
        // DD-MM-YYYY
        const [day, month, year] = parts.map(Number);
        date = new Date(year, month - 1, day);
      }
    } else if (dateString.includes('/')) {
      // DD/MM/YYYY
      const [day, month, year] = dateString.split('/').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      return dateString;
    }

    return formatDate(date, format);
  } catch {
    return dateString;
  }
};

// Función auxiliar para traducir estado
const getEstadoActa = (tipoActa: string): string => {
  switch (tipoActa) {
    case "conciliada":
      return "CONCILIADA";
    case "pendiente":
      return "PENDIENTE";
    case "con_novedad":
      return "CON NOVEDAD";
    default:
      return "SIN ESTADO";
  }
};

export const exportActasDetalladasToExcel = (
  actas: any[], 
  tipo: string = "actas"
) => {
  if (!actas || actas.length === 0) {
    alert("NO HAY ACTAS PARA EXPORTAR");
    return;
  }

  // Preparar datos con residuos expandidos
  const datosParaExcel = actas.flatMap((acta) => {
    const pesoTotalReportado = acta.residuos?.reduce((sum: number, r: any) => 
      sum + Number(r.peso_reportado ?? 0), 0) || 0;
    
    const pesoTotalConciliado = acta.residuos?.reduce((sum: number, r: any) => 
      sum + Number(r.peso_conciliado ?? r.peso_reportado ?? 0), 0) || 0;
    
    // Si no hay residuos, crear una fila
    if (!acta.residuos || acta.residuos.length === 0) {
      return [{
        // ORDEN CORREGIDO SEGÚN LO SOLICITADO - TODOS EN MAYÚSCULA
        "FECHA": acta.fecha_acta ? formatDateString(acta.fecha_acta, "dd/mm/yyyy") : "",
        "SEDE": acta.sede_nombre || "SIN SEDE",
        "ACTA": acta.numero_acta || "",
        "CONSECUTIVO": acta.consecutivo || "",
        "PESO ACTA (KG)": "0.00",
        "CÓDIGO CENTRO DE COSTOS": acta.centro_costo_codigo || "",
        "NOMBRE CENTRO DE COSTOS": acta.centro_costo_nombre || "",
        "CLASE DE MOVIMIENTO": acta.clase_movimiento || "SIN CLASE",
        "ÁREA": acta.subarea_nombre || "SIN ÁREA",
        "TIPO DE PRODUCTO": "SIN RESIDUOS",
        "PESO TIPO PRODUCTO (KG)": "0.00",
        
        // COLUMNAS RESTANTES EN MAYÚSCULA
        "ESTADO": getEstadoActa(acta.tipo),
        "NÚMERO DE INVENTARIO": acta.numero_inventario || "",
        "OPERARIO (CÉDULA)": acta.operario_documento || "",
        "OPERARIO (NOMBRE)": acta.operario_nombre || "",
        "CONCILIADOR (CÉDULA)": acta.conciliador_documento || "",
        "CONCILIADOR (NOMBRE)": acta.conciliador_nombre || "",
        "PESO REPORTADO (KG)": "0.00",
        "PESO CONCILIADO (KG)": "0.00",
        "FECHA CONCILIACIÓN": acta.fecha_conciliacion
          ? formatDateString(acta.fecha_conciliacion, "dd/mm/yyyy")
          : "",
        "NÚMERO DE RESIDUOS": 0,
        "NOVEDAD": acta.novedad || "",
        "MOTIVO RESIDUO": "",
        "PESO TOTAL (KG)": "0.00",
      }];
    }

    // Para cada residuo, crear una fila
    return acta.residuos.map((residuo: any, index: number) => {
      const pesoResiduo = Number(residuo.peso_conciliado ?? residuo.peso_reportado ?? 0);
      const pesoTotalResiduos = pesoTotalConciliado;
      
      return {
        // ORDEN CORREGIDO SEGÚN LO SOLICITADO - TODOS EN MAYÚSCULA
        "FECHA": acta.fecha_acta ? formatDateString(acta.fecha_acta, "dd/mm/yyyy") : "",
        "SEDE": acta.sede_nombre || "SIN SEDE",
        "ACTA": acta.numero_acta || "",
        "CONSECUTIVO": acta.consecutivo || "",
        "PESO ACTA (KG)": pesoTotalResiduos.toFixed(2),
        "CÓDIGO CENTRO DE COSTOS": acta.centro_costo_codigo || "",
        "NOMBRE CENTRO DE COSTOS": acta.centro_costo_nombre || "",
        "CLASE DE MOVIMIENTO": acta.clase_movimiento || "SIN CLASE",
        "ÁREA": acta.subarea_nombre || "SIN ÁREA",
        "TIPO DE PRODUCTO": residuo.residuo_nombre || `RESIDUO ${index + 1}`,
        "PESO TIPO PRODUCTO (KG)": pesoResiduo.toFixed(2),
        
        // COLUMNAS RESTANTES EN MAYÚSCULA
        "ESTADO": getEstadoActa(acta.tipo),
        "NÚMERO DE INVENTARIO": acta.numero_inventario || "",
        "OPERARIO (CÉDULA)": acta.operario_documento || "",
        "OPERARIO (NOMBRE)": acta.operario_nombre || "",
        "CONCILIADOR (CÉDULA)": acta.conciliador_documento || "",
        "CONCILIADOR (NOMBRE)": acta.conciliador_nombre || "",
        "PESO REPORTADO (KG)": pesoTotalReportado.toFixed(2),
        "PESO CONCILIADO (KG)": pesoTotalConciliado.toFixed(2),
        "FECHA CONCILIACIÓN": acta.fecha_conciliacion
          ? formatDateString(acta.fecha_conciliacion, "dd/mm/yyyy")
          : "",
        "NÚMERO DE RESIDUOS": acta.residuos.length,
        "NOVEDAD": acta.novedad || "",
        "MOTIVO RESIDUO": residuo.motivo || "",
        "PESO TOTAL (KG)": pesoTotalResiduos.toFixed(2),
      };
    });
  });

  // Llamar a la función exportToExcel SIN colores
  exportToExcel(datosParaExcel, `${tipo.toUpperCase()}_DETALLADAS`, {
    sheetName: "ACTAS DETALLADAS",
    showFilter: true,
    autoSizeColumns: true,
    dateFormat: "dd/mm/yyyy"
  });
};