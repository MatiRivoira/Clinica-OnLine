import { Component } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { SweetAlertService } from '../../../services/sweetAlert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.scss']
})
export class TurnosComponent {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];
  filtro: string = '';
  isAdmin: boolean = false;

  users: any[] = [];

  constructor(
    private firestoreSvc: FirestoreService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit(): void {
    this.cargarTurnos();
    this.firestoreSvc.getDocuments("users").subscribe(users => {
      this.users = users;
    });
  }

  cargarTurnos(): void {
    this.firestoreSvc.getDocuments("turnos").subscribe(turnos => {
      this.turnos = turnos;
      this.aplicarFiltros();
    });
  }

  aplicarFiltros(): void {
    const filtroLowerCase = this.filtro.toLowerCase();
    this.turnosFiltrados = this.turnos.filter(turno => {
      return (
        turno.especialidad.toLowerCase().includes(filtroLowerCase) ||
        this.obtenerUsuario(turno.especialista).toLowerCase().includes(filtroLowerCase) ||
        this.obtenerUsuario(turno.paciente).toLowerCase().includes(filtroLowerCase) ||
        turno.fecha.toLowerCase().includes(filtroLowerCase) ||
        turno.horario.toLowerCase().includes(filtroLowerCase) ||
        turno.estado.toLowerCase().includes(filtroLowerCase) ||
        this.historiaClinicaIncluye(turno.historialClinico, filtroLowerCase)
      );
    });
  }

  historiaClinicaIncluye(historiaClinica: any, filtro: string): boolean {
    if (!historiaClinica) return false;
    return (
      (historiaClinica.altura && historiaClinica.altura.toLowerCase().includes(filtro)) ||
      (historiaClinica.peso && historiaClinica.peso.toLowerCase().includes(filtro)) ||
      (historiaClinica.temperatura && historiaClinica.temperatura.toLowerCase().includes(filtro)) ||
      (historiaClinica.presion && historiaClinica.presion.toLowerCase().includes(filtro)) ||
      (historiaClinica.datosDinamicos && historiaClinica.datosDinamicos.some((dato:any) => 
        dato.clave.toLowerCase().includes(filtro) || dato.valor.toLowerCase().includes(filtro)
      ))
    );
  }

  puedeCancelar(turno: any): boolean {
    return !['Aceptado', 'Realizado', 'Rechazado', 'Cancelado'].includes(turno.estado);
  }

  cancelarTurno(turno: any): void {
    this.sweetAlert.showPrompt('Cancelar Turno', 'Por favor, ingresa un motivo para la cancelación:')
      .then(result => {
        if (result.isConfirmed && result.value) {
          this.firestoreSvc.updateDocument('turnos', turno.id, { estado: 'Cancelado', comentario: result.value })
            .then(() => {
              this.sweetAlert.showSuccessAlert('El turno ha sido cancelado.', 'Cancelado', 'success');
              this.cargarTurnos(); // Actualiza la lista de turnos después de cancelar
            })
            .catch(error => {
              this.sweetAlert.showSuccessAlert('No se pudo cancelar el turno.', 'Error', 'error');
              console.error('Error al cancelar el turno:', error);
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

  mostrarComentarioF(turno:any){
    this.comentarioSeleccionado = turno.comentario;
    this.mostrarComentario = true;
  }

  verComentario(turno: any): void {
    this.comentarioSeleccionado = turno.comentarioCancelacion || 'Sin comentario';
    this.mostrarComentario = true;
  }
}
