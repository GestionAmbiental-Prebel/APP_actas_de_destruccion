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
      alert("No hay datos para exportar");
      return;
    }

    if (!Array.isArray(data)) {
      throw new Error("Los datos deben ser un array");
    }

    const {
      sheetName = "Datos",
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

    // Agregar estilo de tabla con filtros
    if (showFilter) {
      // Definir el rango de la tabla (incluyendo encabezados y datos)
      const tableRange = XLSX.utils.encode_range({ 
        s: { r: 0, c: 0 }, 
        e: { r: lastRow, c: lastCol } 
      });

      // Agregar propiedad de filtro automático
      worksheet['!autofilter'] = { ref: tableRange };
    }

    // Ajustar automáticamente el ancho de columnas
    if (autoSizeColumns && preparedData.length > 0) {
      const columnWidths: number[] = [];
      const headers = Object.keys(preparedData[0]);
      
      // Ancho mínimo para encabezados
      headers.forEach((header, index) => {
        columnWidths[index] = Math.max(header.length + 2, 10); // +2 para padding
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
        wch: Math.min(width, 50), // Máximo 50 caracteres
        width // Propiedad adicional para compatibilidad
      }));
    }

    // Agregar estilo a los encabezados
    if (worksheet['!ref']) {
      const headers = Object.keys(preparedData[0]);
      
      // Aplicar formato a los encabezados (fila 1)
      headers.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
        
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: headers[colIndex] };
        }
        
        // Agregar estilo al encabezado
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { 
            fgColor: { rgb: "4472C4" }, // Azul de Excel
            patternType: "solid"
          },
          alignment: { 
            horizontal: "center",
            vertical: "center",
            wrapText: true
          },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      });

      // Aplicar bordes a todas las celdas de datos
      for (let row = 1; row <= lastRow; row++) {
        for (let col = 0; col <= lastCol; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          
          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { v: "" };
          }
          
          // Estilo para filas alternadas (bandas)
          if (!worksheet[cellAddress].s) {
            worksheet[cellAddress].s = {};
          }
          
          // Bordes para todas las celdas
          worksheet[cellAddress].s.border = {
            top: { style: "thin", color: { rgb: "D9D9D9" } },
            bottom: { style: "thin", color: { rgb: "D9D9D9" } },
            left: { style: "thin", color: { rgb: "D9D9D9" } },
            right: { style: "thin", color: { rgb: "D9D9D9" } }
          };
          
          // Bandas alternadas para mejor legibilidad
          if (row % 2 === 0) {
            worksheet[cellAddress].s.fill = {
              fgColor: { rgb: "F2F2F2" },
              patternType: "solid"
            };
          }
        }
      }
    }

    // Crear libro con más opciones
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Congelar paneles (fila de encabezado)
    worksheet['!views'] = [{
      state: 'frozen',
      xSplit: 0,
      ySplit: 1, // Congela la primera fila
      topLeftCell: 'A2',
      activeCell: 'A2'
    }];

    // Agregar propiedades del libro
    workbook.Props = {
      Title: fileName,
      Author: "Sistema de Gestión Ambiental",
      CreatedDate: new Date()
    };

    // Convertir a blob con mejor rendimiento
    const excelBuffer = XLSX.write(workbook, { 
      bookType: "xlsx", 
      type: "array",
      cellStyles: true,
      bookSST: false
    });

    const blob = new Blob([excelBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
    });

    // Generar nombre con fecha
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const finalFileName = `${fileName}_${timestamp}.xlsx`;

    // Descargar
    saveAs(blob, finalFileName);

    console.log(`✅ Exportado: ${finalFileName} (${preparedData.length} registros)`);

  } catch (error) {
    console.error("❌ Error al exportar a Excel:", error);
    alert("Ocurrió un error al exportar los datos. Por favor, intente nuevamente.");
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
      return "Conciliada";
    case "pendiente":
      return "Pendiente";
    case "con_novedad":
      return "Con Novedad";
    default:
      return "Sin estado";
  }
};

export const exportActasDetalladasToExcel = (
  actas: any[], 
  tipo: string = "actas"
) => {
  if (!actas || actas.length === 0) {
    alert("No hay actas para exportar");
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
        "Número de Acta": acta.numero_acta || "",
        "Fecha": acta.fecha_acta ? formatDateString(acta.fecha_acta, "dd/mm/yyyy") : "",
        "Estado": getEstadoActa(acta.tipo),
        "Sede": acta.sede_nombre || "Sin sede",
        "Subárea": acta.subarea_nombre || "Sin subárea",
        "Código Centro de Costo": acta.centro_costo_codigo || "",
        "Nombre Centro de Costo": acta.centro_costo_nombre || "",
        "Clase de Movimiento": acta.clase_movimiento || "Sin clase",
        "Consecutivo": acta.consecutivo || "",
        "Número de Inventario": acta.numero_inventario || "",
        "Operario (Cédula)": acta.operario_documento || "",
        "Operario (Nombre)": acta.operario_nombre || "",
        "Conciliador (Cédula)": acta.conciliador_documento || "",
        "Conciliador (Nombre)": acta.conciliador_nombre || "",
        "Peso Reportado (kg)": "0.00",
        "Peso Conciliado (kg)": "0.00",
        "Fecha Conciliación": acta.fecha_conciliacion
          ? formatDateString(acta.fecha_conciliacion, "dd/mm/yyyy")
          : "",
        "Número de Residuos": 0,
        "Novedad": acta.novedad || "",
        "Residuo": "SIN RESIDUOS",
        "Peso Residuo (kg)": "0.00",
        "Motivo Residuo": "",
        "Peso Total (kg)": "0.00",
      }];
    }

    // Para cada residuo, crear una fila
    return acta.residuos.map((residuo: any, index: number) => {
      const pesoResiduo = Number(residuo.peso_conciliado ?? residuo.peso_reportado ?? 0);
      
      return {
        "Número de Acta": acta.numero_acta || "",
        "Fecha": acta.fecha_acta ? formatDateString(acta.fecha_acta, "dd/mm/yyyy") : "",
        "Estado": getEstadoActa(acta.tipo),
        "Sede": acta.sede_nombre || "Sin sede",
        "Subárea": acta.subarea_nombre || "Sin subárea",
        "Código Centro de Costo": acta.centro_costo_codigo || "",
        "Nombre Centro de Costo": acta.centro_costo_nombre || "",
        "Clase de Movimiento": acta.clase_movimiento || "Sin clase",
        "Consecutivo": acta.consecutivo || "",
        "Número de Inventario": acta.numero_inventario || "",
        "Operario (Cédula)": acta.operario_documento || "",
        "Operario (Nombre)": acta.operario_nombre || "",
        "Conciliador (Cédula)": acta.conciliador_documento || "",
        "Conciliador (Nombre)": acta.conciliador_nombre || "",
        "Peso Reportado (kg)": pesoTotalReportado.toFixed(2),
        "Peso Conciliado (kg)": pesoTotalConciliado.toFixed(2),
        "Fecha Conciliación": acta.fecha_conciliacion
          ? formatDateString(acta.fecha_conciliacion, "dd/mm/yyyy")
          : "",
        "Número de Residuos": acta.residuos.length,
        "Novedad": acta.novedad || "",
        "Residuo": residuo.residuo_nombre || `Residuo ${index + 1}`,
        "Peso Residuo (kg)": pesoResiduo.toFixed(2),
        "Motivo Residuo": residuo.motivo || "",
        "Peso Total (kg)": pesoTotalConciliado.toFixed(2),
      };
    });
  });

  exportToExcel(datosParaExcel, `${tipo}_detalladas`, {
    sheetName: "Actas Detalladas",
    showFilter: true,
    autoSizeColumns: true,
    dateFormat: "dd/mm/yyyy"
  });
};