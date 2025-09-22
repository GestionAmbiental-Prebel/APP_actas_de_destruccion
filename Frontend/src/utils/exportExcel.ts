import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

 
export const exportToExcel = (data: any[], fileName: string, sheetName = "Sheet1") => {
  // Crear hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Crear libro
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Convertir a blob
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  // Descargar
  saveAs(blob, `${fileName}.xlsx`);
};
