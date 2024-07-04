// excel-download-generic.service.ts
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExcelDownloadGenericService {

  constructor() { }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `${fileName}_${new Date().toLocaleDateString()}.xlsx`);
  }

  descargarExcel(data: any[], fileName: string, sheetName: string = 'Datos'): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { [sheetName]: worksheet }, SheetNames: [sheetName] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }

  descargarExcelMuchasHojas(datos: any[], nombresHojas: string[], nombresDatos: string[], fileName: string): void {
    const workbook: XLSX.WorkBook = { Sheets: {}, SheetNames: [] };

    for (let i = 0; i < datos.length; i++) {
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datos[i]);
      workbook.Sheets[nombresHojas[i]] = worksheet;
      workbook.SheetNames.push(nombresHojas[i]);
    }

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }
}
