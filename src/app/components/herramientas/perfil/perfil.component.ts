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
    this.usuario.especialidad[this.especialidadElegida].horarios = this.horarios;
    this.bdSvc.updateDocument("users", this.usuario.id, this.usuario).then(() => {
      this.sweetAlert.showSuccessAlert("Horarios guardados correctamente", "Exito", "success");
    })
    .catch(err => {
      this.sweetAlert.showSuccessAlert("Error al guardar los horarios", "Error", "error");
      console.error("Error al guardar los horarios", err);
    });
  }

  agregarHorario(): void {
    this.horarios.push({
      dia: '',
      horaInicio: '',
      horaFin: ''
    });
  }

  eliminarHorario(index: number): void {
    // Eliminar un horario por índice
    this.horarios.splice(index, 1);
  }
}
