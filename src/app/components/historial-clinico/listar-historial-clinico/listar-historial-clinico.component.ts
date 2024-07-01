import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { PdfDownloadService } from '../../../services/pdf-download.service';
import { SweetAlertService } from '../../../services/sweetAlert.service';

@Component({
  selector: 'app-listar-historial-clinico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-historial-clinico.component.html',
  styleUrls: ['./listar-historial-clinico.component.scss']
})
export class ListarHistorialClinicoComponent implements OnChanges {

  @Input() usuarioID: any; // Objeto para almacenar los datos del usuario actual

  users:any;

  turnos: any[] = [];
  bdSvc = inject(FirestoreService);
  pdfSvc = inject(PdfDownloadService);
  firestoreSvc = inject(FirestoreService);
  alert = inject(SweetAlertService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarioID']) {
      this.cargarHistorialClinico();
    }
    this.firestoreSvc.getDocuments("users").subscribe(turnos => {
      this.users = turnos;
    });
  }

  cargarHistorialClinico(): void {
    this.turnos = [];
    this.bdSvc.getDocuments('turnos').subscribe((turnos: any[]) => {
      this.turnos = turnos.filter(turno => turno.historialClinico && turno.paciente === this.usuarioID);
    });
  }

  mostrarDatosDinamicos(datos: any[]): string {
    return datos.map(dato => `${dato.clave}: ${dato.valor}`).join('<br>');
  }

  especialidades!:any;
  generarYDescargarPDF(turnos:any[], cerrarFrm:boolean = false): void {
    if (turnos) {
      let contenidoPDF = '';

      turnos.forEach(turno => {
        contenidoPDF += `
          Fecha: ${turno.fecha}
          Especialidad: ${turno.especialidad}
          Especialista: ${this.obtenerUsuario(turno.especialista)}
          Altura: ${turno.historialClinico.altura}
          Peso: ${turno.historialClinico.peso}
          Temperatura: ${turno.historialClinico.temperatura}
          Presión: ${turno.historialClinico.presion}
          Datos dinámicos: ${this.mostrarDatosDinamicos(turno.historialClinico.datosDinamicos)}
          ----------------------------------------------
        `;
      });

      this.pdfSvc.downloadPDF(contenidoPDF, 'Turnos');

      if (cerrarFrm) {
        this.especialidades = undefined;
      }
    } else {
      this.alert.showSuccessAlert("Seleccione una especialidad", "Error", "error");
    }
  }

  obtenerUsuario(id: string): string {
    const usuario = this.users.find((u:any) => u.id === id);
    if (usuario) {
      return `${usuario.nombre} ${usuario.apellido}`;
    }
    return ''; // Manejar caso donde no se encuentra el usuario
  }

  descargarPorEspecialidad() : void{
    this.turnos.forEach((turno) => {
      this.especialidades = this.guardarSinRepetir(this.especialidades, turno.especialidad);
    });
  }

  especialidadElegida!:string;
  turnosFiltradosPorEspecialidad!:any[];
  onEspecialidadElegida($event:any){
    this.especialidadElegida = $event.target.value;
    this.turnosFiltradosPorEspecialidad = this.turnos.filter(turno => turno.especialidad === this.especialidadElegida);
  }

  guardarSinRepetir(arrayOriginal: any[], elemento: any): any[] {
    const set = new Set(arrayOriginal);
    set.add(elemento)
    return Array.from(set);
  }
}
