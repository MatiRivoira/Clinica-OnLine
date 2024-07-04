import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PdfDownloadService } from '../../../services/pdf-download.service';
import { ExcelDownloadGenericService } from '../../../services/excel-download.service';
import { TransformarIDaStringPipe } from '../../../pipes/transformar-ida-string.pipe';
import { DiaHorarioPipePipe } from '../../../pipes/dia-horario-pipe.pipe';
import { GraficoToStringPipe } from '../../../pipes/grafico-to-string.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [DiaHorarioPipePipe , TransformarIDaStringPipe, GraficoToStringPipe]
})
export class DashboardComponent implements OnInit {
  @Input() user:any;
  @Input() ultimoTurno:any;
  @Output() click = new EventEmitter<any>();

  users:any;
  barChar: any;
  logIngresos!: any;
  turnosPorEspecialidad!:any;
  turnosPorDia!: any;
  turnosPorMedico!: any;
  turnosFinalizadosPorMedico!: any;

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
 
  colorScheme: any = {
    domain: [
      '#22e1bf', // Color principal (más claro)
      '#1fc7a5', '#1ca88a', '#197b6f', '#165d54', // Tonos más oscuros
      '#134f3a', '#103f29', '#0d3019', '#0a2108' // Tonos aún más oscuros
    ]
  };

  constructor(private dataService: FirestoreService, 
              private pdfService:PdfDownloadService, 
              private xlsService:ExcelDownloadGenericService, 
              private datePipe: DiaHorarioPipePipe, 
              private obteberUsr : TransformarIDaStringPipe, 
              private graficoToString:GraficoToStringPipe) {}

  handleClick(event: Event, action?: string) {
    event.stopPropagation();
    if (action) {
      this.click.emit(action);
    }
  }

  ngOnInit(): void {
    this.dataService.getDocuments("users").subscribe(data => {
      this.users = data;
    });

    this.dataService.getDocuments("logs").subscribe(data => {
      this.logIngresos = data.map(item => ({
        name: `${item.usuario} - ${this.datePipe.transform(item.fechaDeIngreso)}`,
        value: 1 // Puedes ajustar esto según tus necesidades (por ejemplo, contar eventos)
      }));
    });

    this.dataService.getDocuments("turnos").subscribe(data => {
      const turnosPorEspecialidad = this.groupAndSumByEspecialidad(data);
      this.turnosPorEspecialidad = turnosPorEspecialidad.map(item => ({
        name: item.especialidad,
        value: item.totalTurnos
      }));

      const turnosPorDia = this.groupAndSumByDia(data);
      this.turnosPorDia = turnosPorDia.map(item => ({
        name: item.dia,
        value: item.totalTurnos
      }));
      
      const turnosPorMedico = this.groupAndCountByMedico(data);
      this.turnosPorMedico = turnosPorMedico.map(item => ({
        name: item.medico,
        value: item.totalTurnos
      }));

      const turnosFinalizadosPorMedico = this.groupAndCountByMedico(data.filter(item => item.estado === "Realizado"));
      this.turnosFinalizadosPorMedico = turnosFinalizadosPorMedico.map(item => ({
        name: item.medico,
        value: item.totalTurnos
      }));

    });
  }

  groupAndCountByMedico(data: any[]): any[] {
    const grouped = data.reduce((acc, curr) => {
      const medico = curr.especialista;
      if (!acc[medico]) {
        acc[medico] = {
          medico: this.obteberUsr.transform(medico, this.users),
          totalTurnos: 0
        };
      }
      acc[medico].totalTurnos++;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  groupAndSumByEspecialidad(data: any[]): any[] {
    const grouped = data.reduce((acc, curr) => {
      const especialidad = curr.especialidad;
      if (!acc[especialidad]) {
        acc[especialidad] = {
          especialidad: especialidad,
          totalTurnos: 0
        };
      }
      acc[especialidad].totalTurnos++;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  groupAndSumByDia(data: any[]): any[] {
    const grouped = data.reduce((acc, curr) => {
      const fecha = this.parseFecha(curr.fecha); // Parsear la fecha
      if (!acc[fecha]) {
        acc[fecha] = {
          dia: fecha,
          totalTurnos: 0
        };
      }
      acc[fecha].totalTurnos++;
      return acc;
    }, {});

    return Object.values(grouped);
  }

  // Función para parsear la fecha en formato "Viernes, 28 de junio de 2024" a un formato de solo día
  parseFecha(fechaStr: string): string {
    const partes = fechaStr.split(', ')[1]; // Obtener la parte "28 de junio de 2024"
    return partes; // Retornar solo la parte de la fecha sin el día de la semana
  }
  

  exportToPDF(): void {
    let pdfTxt:string = "";

    pdfTxt += `Log de Ingresos al Sistema \n---------------------------------------------- \n`;
    this.logIngresos.forEach((log:any) => {
      pdfTxt += `${log.name}\n`;
    });

    pdfTxt += `\n\nTurnos por especialidad \n---------------------------------------------- \n`;
    this.turnosPorEspecialidad.forEach((turno:any) => {
      pdfTxt += this.graficoToString.transform(turno);
    });

    pdfTxt += `\n\nTurnos por dia \n---------------------------------------------- \n`;
    this.turnosPorDia.forEach((turno:any) => {
      pdfTxt += this.graficoToString.transform(turno);
    });

    pdfTxt += `\n\nTurnos por solicitados por medico \n---------------------------------------------- \n`;
    this.turnosPorMedico.forEach((turno:any) => {
      pdfTxt += this.graficoToString.transform(turno);
    });

    pdfTxt += `\n\nTurnos por realizados por medico \n---------------------------------------------- \n`;
    this.turnosFinalizadosPorMedico.forEach((turno:any) => {
      pdfTxt += this.graficoToString.transform(turno);
    });

    this.pdfService.downloadPDF(pdfTxt, `Informes_${new Date().toLocaleDateString()}`);
  }

  exportToExcel(): void {
    const nombresHojas = ['Log de Ingresos al Sistema', 'Turnos por especialidad', 'Turnos por dia', 'Turnos solicitados', 'Turnos realizados'];
    const datos = [this.logIngresos, this.turnosPorEspecialidad, this.turnosPorDia, this.turnosPorMedico, this.turnosFinalizadosPorMedico];

    this.xlsService.descargarExcelMuchasHojas(datos, nombresHojas, ['name', 'especialidad', 'dia'], `Informes`);
  }
  
}
