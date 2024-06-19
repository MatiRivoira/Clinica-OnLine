import { CommonModule } from '@angular/common';
import { Component, Input, inject, input } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { SweetAlertService } from '../../../services/sweetAlert.service';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss'
})
export class MisTurnosComponent {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filtroEspecialidad: string = '';
  filtroEspecialista: string = '';
  isAdmin: boolean = false;

  title:string = "Comentarios";

  users: any[] = [];

  @Input() user:any;

  constructor(
    private firestoreSvc: FirestoreService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.cargarTurnos();
    this.firestoreSvc.getDocuments("users").subscribe(turnos => {
      this.users = turnos;
    });
  }

  cargarTurnos(): void {
    this.firestoreSvc.getDocumentsWhere("turnos", this.user.userType, this.user.id).subscribe(turnos => {
      this.turnos = turnos;
      this.turnosFiltrados = turnos;
    });
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    switch (this.user.userType) {
      case "paciente":
        this.turnosFiltrados = this.turnos.filter(turno =>
          turno.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase()) &&
          this.obtenerUsuario(turno.especialista).toLowerCase().includes(this.filtroEspecialista.toLowerCase())
        );
        break;
      case "especialista":
        this.turnosFiltrados = this.turnos.filter(turno =>
          turno.especialidad.toLowerCase().includes(this.filtroEspecialidad.toLowerCase()) &&
          this.obtenerUsuario(turno.paciente).toLowerCase().includes(this.filtroEspecialista.toLowerCase())
        );
        break;
    }
    
  }


  calificarAtencion(turno: any): void {
    this.sweetAlert.showPrompt(`Calificar turno`, 'Por favor, deja un comentario sobre el turno.')
      .then(result => {
        if (result.isConfirmed && result.value) {
          this.firestoreSvc.updateDocument('turnos', turno.id, { comentario: result.value })
            .then(() => {
              this.sweetAlert.showSuccessAlert(`El turno ha sido calificado.`, "Calificado", 'success');
              this.cargarTurnos(); // Actualiza la lista de turnos después de cancelar
            })
            .catch(error => {
              this.sweetAlert.showSuccessAlert(`No se pudo calificar el turno.`, 'Error', 'error');
              console.error(`Error al calificar el turno:`, error);
            });
        }
      });
  }

  puedeCancelar(turno: any): boolean {
    return !['Realizado', 'Rechazado', 'Cancelado'].includes(turno.estado);
  }


  cancelarTurno(turno: any, estado:string): void {
    this.sweetAlert.showPrompt(`${estado} turno`, 'Por favor, ingresa un motivo.')
      .then(result => {
        if (result.isConfirmed && result.value) {
          this.firestoreSvc.updateDocument('turnos', turno.id, { estado: estado, comentario: result.value })
            .then(() => {
              this.sweetAlert.showSuccessAlert(`El turno ha sido ${estado}.`, estado, 'success');
              this.cargarTurnos(); // Actualiza la lista de turnos después de cancelar
            })
            .catch(error => {
              this.sweetAlert.showSuccessAlert(`No se pudo ${estado} el turno.`, 'Error', 'error');
              console.error(`Error al ${estado} el turno:`, error);
            });
        }
      });
  }

  aceptarTurno(turno: any): void {
    this.firestoreSvc.updateDocument('turnos', turno.id, { estado: "Aceptado" })
    .then(() => {
      this.sweetAlert.showSuccessAlert(`El turno ha sido aceptado.`, "Aceptado", 'success');
      this.cargarTurnos(); // Actualiza la lista de turnos después de cancelar
    })
    .catch(error => {
      this.sweetAlert.showSuccessAlert(`No se pudo aceptar el turno.`, 'Error', 'error');
      console.error(`Error al aceptar el turno:`, error);
    });
  }

  finalizarTurno(turno: any): void {
    this.sweetAlert.showPrompt(`Finalizar turno`, 'Por favor, ingresa una reseña de la consulta.')
      .then(result => {
        if (result.isConfirmed && result.value) {
          const resenia = result.value;
  
          this.sweetAlert.showPrompt(`Diagnóstico`, 'Por favor, ingresa el diagnóstico realizado.')
            .then(diagResult => {
              if (diagResult.isConfirmed && diagResult.value) {
                const diagnostico = diagResult.value;
  
                this.firestoreSvc.updateDocument('turnos', turno.id, { 
                  estado: "Realizado", 
                  resenia: resenia, 
                  diagnostico: diagnostico 
                })
                  .then(() => {
                    this.sweetAlert.showSuccessAlert(`El turno ha sido finalizado.`, "Finalizado", 'success');
                    this.cargarTurnos(); // Actualiza la lista de turnos después de finalizar
                  })
                  .catch(error => {
                    this.sweetAlert.showSuccessAlert(`No se pudo finalizar el turno.`, 'Error', 'error');
                    console.error(`Error al finalizar el turno:`, error);
                  });
              }
            });
        }
      });
  }
  
  

  obtenerUsuario(id: string): string {
    const usuario = this.users.find(u => u.id === id);
    if (usuario) {
      return `${usuario.nombre} ${usuario.apellido}`;
    }
    return ''; // Manejar caso donde no se encuentra el usuario
  }

  mostrarComentario: boolean = false;
  comentarioSeleccionado: string = '';

  mostrarComentarioF(turno:any, titulo:string) : void{
    this.title = titulo;
    this.comentarioSeleccionado = "";
    if (turno.comentario) {
      this.comentarioSeleccionado = `<strong>Comentario:</strong> ${turno.comentario} <br>`;
    }
    if (turno.diagnostico) {
      this.title = "Ver reseña y diagnostico";
      this.comentarioSeleccionado += `<strong>Reseña:</strong> ${turno.resenia} <br> <strong>Diagnostico:</strong> ${turno.diagnostico}`;
    }
    this.mostrarComentario = true;
  }
}
