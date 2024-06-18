import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlertService } from '../../../services/sweetAlert.service';
import { DateEspañolPipe } from '../../../pipes/date-español.pipe';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DateEspañolPipe],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.scss'
})
export class SolicitarTurnoComponent {
  especialidadSeleccionada: string = '';
  especialistaSeleccionado: any;
  otraEspecialidadSeleccionada: string = '';
  fechaSeleccionada: string = '';
  fechasDisponibles: Date[] = [];

  firestoreSvc = inject(FirestoreService);
  sweetAlert = inject(SweetAlertService);

  @Input() user:any;

  errorStates = {
    especialidad: false,
    otraEspecialidad: false,
    especialista: false,
    fecha: false,
  };

  especialistas: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // Lógica para cargar las fechas disponibles dentro de los próximos 15 días
    this.cargarFechasDisponibles();
  }

  cargarFechasDisponibles(): void {
    // Aquí deberías implementar la lógica para cargar las fechas disponibles
    // relacionadas con la disponibilidad del especialista seleccionado
    // Esta es una implementación de ejemplo que carga las fechas de los próximos 15 días
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 15); // Próximos 15 días

    // Simulación de fechas disponibles (ejemplo)
    this.fechasDisponibles = this.getFechasEntre(hoy, limite);
  }

  getFechasEntre(fechaInicio: Date, fechaFin: Date): Date[] {
    const fechas: Date[] = [];
    let fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFin) {
      fechas.push(new Date(fechaActual));
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return fechas;
  }

  solicitarTurno(formularioTurno: any): void {
    if (formularioTurno.valid) {
      
      this.firestoreSvc.addDocument("turnos", {
        especialidad: this.especialidadSeleccionada,
        especialista: this.especialistaSeleccionado,
        fecha: this.fechaSeleccionada,
        uid: this.user.id,
        estado: 'Pendiente' 
      }).then(() => {
        this.sweetAlert.showSuccessAlert("Se subió con éxito el producto", "Éxito", "success");
      }).catch((error) => {
        console.error('Error al solicitar el turno:', error);
        this.sweetAlert.showSuccessAlert("Error al solicitar el turno", "Error", "error");
      });
    }
  }

  otraEspecialidad: boolean = false;
  @ViewChild('especialidadPersonalizadaInput') especialidadPersonalizadaInput!: ElementRef;

  onEspecialidadChange(event: any) {
    this.especialidadSeleccionada = event.target.value;
    this.otraEspecialidad = this.especialidadSeleccionada === 'otra';
    if (this.otraEspecialidad) {
      setTimeout(() => {
        this.especialidadPersonalizadaInput.nativeElement.focus();
      }, 0);
    } else {
      this.otraEspecialidadSeleccionada = "";
      this.firestoreSvc.getDocumentsWhere("users", "especialidad", this.especialidadSeleccionada).subscribe(especialistas => {
        this.especialistas = especialistas;
      })
    }
  }

  onOtraEspecialidadChange(value:string) {
    this.otraEspecialidadSeleccionada = value;
    this.firestoreSvc.getDocumentsWhere("users", "especialidadPersonalizada", this.otraEspecialidadSeleccionada).subscribe(especialistas => {
      this.especialistas = especialistas;
    })
  }

  onEspecialistaChange($event:any): void {
    this.fechasDisponibles = [];
    this.especialistaSeleccionado = $event.target.value;
    this.firestoreSvc.getDocument("users", this.especialistaSeleccionado).subscribe(especialista => {
      if (especialista) {
        if (especialista.horarios) {
          let dias = new Set<string>();
          especialista.horarios.forEach((horario: any) => {
            dias.add(horario.dia);
          });
          this.fechasDisponibles = this.obtenerFechasProximas(Array.from(dias));
        } else {
          this.fechasDisponibles = [];
        }
      }
    })
  }

  obtenerFechasProximas(diasSemana: string[]): Date[] {
    const diasDeLaSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 15); // Próximos 15 días
  
    const fechasProximas: Date[] = [];
  
    for (let i = 0; i <= 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const diaSemana = diasDeLaSemana[fecha.getDay()];
  
      if (diasSemana.includes(diaSemana)) {
        fechasProximas.push(fecha);
      }
    }
  
    return fechasProximas;
  }
  
}
