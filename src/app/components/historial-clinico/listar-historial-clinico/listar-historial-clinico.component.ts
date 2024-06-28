import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { PdfDownloadService } from '../../../services/pdf-download.service';

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

  generarYDescargarPDF(): void {
    let contenidoPDF = '';

    this.turnos.forEach(turno => {
      contenidoPDF += `
        Fecha: ${turno.fecha}
        Horario: ${turno.horario}
        Especialidad: ${turno.especialidad}
        Especialista: ${this.obtenerUsuario(turno.especialista)}
        Paciente: ${this.obtenerUsuario(turno.paciente)}
        Estado: ${turno.estado}
        ----------------------------------------------
      `;
    });

    this.pdfSvc.downloadPDF(contenidoPDF, 'Turnos');
  }

  obtenerUsuario(id: string): string {
    const usuario = this.users.find((u:any) => u.id === id);
    if (usuario) {
      return `${usuario.nombre} ${usuario.apellido}`;
    }
    return ''; // Manejar caso donde no se encuentra el usuario
  }
}
