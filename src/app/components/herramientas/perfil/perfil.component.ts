import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { SweetAlertService } from '../../../services/sweetAlert.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  @Input() usuario: any; // Objeto para almacenar los datos del usuario actual
  especialidades: any[] = []; // Lista de especialidades asociadas al especialista
  horarios: any[] = []; // Lista de horarios del especialista

  especialidadElegida :number = -1;

  diasPermitidos: { [key: string]: { inicio: string, fin: string } } = {
    'Lunes': { inicio: '08:00', fin: '19:00' },
    'Martes': { inicio: '08:00', fin: '19:00' },
    'Miercoles': { inicio: '08:00', fin: '19:00' },
    'Jueves': { inicio: '08:00', fin: '19:00' },
    'Viernes': { inicio: '08:00', fin: '19:00' },
    'Sabado': { inicio: '08:00', fin: '14:00' }
  };

  bdSvc = inject(FirestoreService);
  sweetAlert = inject(SweetAlertService);

  constructor() { }

  ngOnInit(): void {
    if (this.usuario.horarios) {
      this.horarios = this.usuario.horarios;
    }
    this.especialidades = this.usuario.especialidad;
  }

  onEspecialidadElegida($event:any){
    this.especialidadElegida = $event.target.value;
    this.horarios = this.especialidades[this.especialidadElegida].horarios;
  }

  guardarHorarios(): void {
    if (this.validarHorarios()) {
      this.usuario.especialidad[this.especialidadElegida].horarios = this.horarios;
      this.bdSvc.updateDocument("users", this.usuario.id, this.usuario).then(() => {
        this.sweetAlert.showSuccessAlert("Horarios guardados correctamente", "Exito", "success");
      })
      .catch(err => {
        this.sweetAlert.showSuccessAlert("Error al guardar los horarios", "Error", "error");
        console.error("Error al guardar los horarios", err);
      });
    }
  }

  validarHorarios(): boolean {
    for (let horario of this.horarios) {
      let dia = horario.dia;
      if (!this.diasPermitidos[dia]) {
        alert(`El día ${horario.dia} no es válido. Solo se permiten de lunes a sábado.`);
        return false;
      }

      let inicio = this.convertirHora(horario.horaInicio);
      let fin = this.convertirHora(horario.horaFin);

      if (inicio >= fin) {
        alert('La hora de inicio debe ser menor que la hora de fin.');
        return false;
      }

      if (!this.estaDentroDelHorarioPermitido(dia, inicio, fin)) {
        alert(`El horario para ${horario.dia} debe estar entre ${this.diasPermitidos[dia].inicio} y ${this.diasPermitidos[dia].fin}.`);
        return false;
      }

      if ((fin - inicio) < 30) {
        alert('La duración mínima de un turno es de 30 minutos.');
        return false;
      }
    }
    return true;
  }

  convertirHora(hora: string): number {
    const [hh, mm] = hora.split(':').map(Number);
    return hh * 60 + mm;  // Convertir a minutos
  }

  estaDentroDelHorarioPermitido(dia: string, inicio: number, fin: number): boolean {
    const inicioPermitido = this.convertirHora(this.diasPermitidos[dia].inicio);
    const finPermitido = this.convertirHora(this.diasPermitidos[dia].fin);
    return inicio >= inicioPermitido && fin <= finPermitido;
  }


  agregarHorario(): void {
    this.horarios.push({
      dia: 'Lunes',
      horaInicio: '',
      horaFin: ''
    });
  }

  eliminarHorario(index: number): void {
    // Eliminar un horario por índice
    this.horarios.splice(index, 1);
  }
}
