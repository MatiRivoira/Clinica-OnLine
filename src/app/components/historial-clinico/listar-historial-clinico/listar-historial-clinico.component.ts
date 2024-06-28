import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-listar-historial-clinico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listar-historial-clinico.component.html',
  styleUrls: ['./listar-historial-clinico.component.scss']
})
export class ListarHistorialClinicoComponent implements OnChanges {

  @Input() usuarioID: any; // Objeto para almacenar los datos del usuario actual

  turnos: any[] = [];
  bdSvc = inject(FirestoreService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarioID']) {
      this.cargarHistorialClinico();
    }
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
}
