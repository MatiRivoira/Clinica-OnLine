import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent {
  turnos: any[] = [];

  firestoreSvc = inject(FirestoreService);

  @Input() user:any;

  constructor() { }

  ngOnInit(): void {
    this.firestoreSvc.getDocumentsWhere("turnos", "uid", this.user.id).subscribe((turnos) => {
      this.turnos = turnos;
    });
  }

  puedeCancelar(turno: any): boolean {
    // Implementa la lógica para verificar si se puede cancelar el turno
    return turno.estado !== 'Realizado' && turno.estado !== 'Cancelado';
  }

  puedeCompletarEncuesta(turno: any): boolean {
    // Implementa la lógica para verificar si se puede completar la encuesta
    return turno.estado === 'Realizado' && turno.comentario && !turno.encuestaCompletada;
  }

  puedeCalificarAtencion(turno: any): boolean {
    // Implementa la lógica para verificar si se puede calificar la atención
    return turno.estado === 'Realizado' && !turno.calificacionAtencion;
  }

  cancelarTurno(turno: any): void {
 
  }

  verResena(turno: any): void {
    // Implementa la función para ver la reseña
    // Puedes mostrar la reseña en un modal o en una nueva página
    console.log('Reseña del turno:', turno.comentario);
  }

  completarEncuesta(turno: any): void {
    // Implementa la función para completar la encuesta
    // Puedes redirigir a una página donde el paciente pueda completar la encuesta
    console.log('Completar encuesta del turno:', turno.id);
  }

  calificarAtencion(turno: any): void {
    // Implementa la función para calificar la atención
    // Puedes abrir un formulario donde el paciente pueda dejar su calificación y comentario
    console.log('Calificar atención del turno:', turno.id);
  }
}
