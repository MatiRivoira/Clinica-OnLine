import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlertService } from '../../../services/sweetAlert.service';
import { DateEspañolPipe } from '../../../pipes/date-español.pipe';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-solicitar-turno',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DateEspañolPipe, LoadingComponent],
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

  isLoading:boolean = false;

  @Input() user:any;

  errorStates = {
    especialidad: false,
    otraEspecialidad: false,
    especialista: false,
    fecha: false,
    horario: false,
    paciente: false
  };

  especialistas: any[] = [];
  pacientes: any[] = [];

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
    this.cargarFechasDisponibles();
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.firestoreSvc.getDocumentsWhere("users", "userType", "paciente").subscribe((pacientes) => {
      this.pacientes = pacientes;
    });
  }

  cargarFechasDisponibles(): void {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 15); 

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

  errMsg: string = "";
  solicitarTurno(formularioTurno: any): void {
    this.isLoading = true;
    this.errMsg = "";
    this.errorStates = {
      especialidad: false,
      otraEspecialidad: false,
      especialista: false,
      fecha: false,
      horario: false,
      paciente: false
    };
    var especialidad = this.especialidadSeleccionada;
    if (this.especialidadSeleccionada === "otra") {
      especialidad = this.otraEspecialidadSeleccionada;
    }
    var userID = this.user.id;
    if (this.user.userType === "admin"){
      userID = formularioTurno.form.value.paciente;
    }
    if (formularioTurno.valid) {
      this.firestoreSvc.addDocument("turnos", {
        especialidad: especialidad,
        especialista: formularioTurno.form.value.especialista,
        fecha: formularioTurno.form.value.fecha,
        horario: formularioTurno.form.value.horario,
        paciente: userID,
        estado: 'Pendiente' 
      }).then(() => {
        this.isLoading = false;
        this.sweetAlert.showSuccessAlert("Se subió con éxito el producto", "Éxito", "success");
        formularioTurno.reset(); // Esto reinicia el formulario
        this.especialidadSeleccionada = '';
        this.otraEspecialidadSeleccionada = '';
        this.fechaSeleccionada = '';
        this.horarios = [];
      }).catch((error) => {
        console.error('Error al solicitar el turno:', error);
        this.isLoading = false;
        this.sweetAlert.showSuccessAlert("Error al solicitar el turno", "Error", "error");
      });
    } else {
      if (!formularioTurno.form.value.especialidad) {
        this.errorStates.especialidad = true;
        this.errMsg = "Complete todos los campos";
      }
      if (!formularioTurno.form.value.especialista) {
        this.errorStates.especialista = true;
        this.errMsg = "Complete todos los campos";
      }
      if (!formularioTurno.form.value.fecha) {
        this.errorStates.fecha = true;
        this.errMsg = "Complete todos los campos";
      }
      if (!formularioTurno.form.value.horario) {
        this.errorStates.horario = true;
        this.errMsg = "Complete todos los campos";
      }
      if (!formularioTurno.form.value.paciente && this.user.userType === "admin") {
        this.errorStates.paciente = true;
        this.errMsg = "Complete todos los campos";
      }
      this.isLoading = false;
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
      this.firestoreSvc.getDocumentsWhereArrayElementMatches("users", "especialidad", "nombre", this.especialidadSeleccionada).subscribe(especialistas => {
        this.especialistas = especialistas;
      })
    }
  }

  onOtraEspecialidadChange(value:string) {
    this.otraEspecialidadSeleccionada = value;
    this.firestoreSvc.getDocumentsWhereArrayElementMatches("users", "especialidad", "nombre", this.otraEspecialidadSeleccionada).subscribe(especialistas => {
      this.especialistas = especialistas;
    })
  }

  especialidad:any;
  onEspecialistaChange($event:any): void {
    this.fechasDisponibles = [];
    this.especialistaSeleccionado = $event.target.value;
    var auxespecialidad:any = this.especialidadSeleccionada;
    if (this.especialidadSeleccionada === "otra") {
      auxespecialidad = this.otraEspecialidadSeleccionada;
    }
    this.firestoreSvc.getDocument("users", this.especialistaSeleccionado).subscribe(especialista => {
      if (especialista) {
        this.especialidad = especialista.especialidad.find((especialidad: any) => especialidad["nombre"] === auxespecialidad);
        if (this.especialidad) {
          let dias = new Set<string>();
          this.especialidad.horarios.forEach((horario: any) => {
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
  

  horarios:any = [];
  onTurnoChange(fecha: any) {
    const diaSeleccionado = (fecha.target.value).split(",")[0];
    const horario = this.especialidad.horarios.find((horario: any) => horario.dia === diaSeleccionado);
    
    if (horario) {
      this.obtenerTurnosReservados(diaSeleccionado, (fecha.target.value).split(",")[1].trim())
        .subscribe((reservados:any) => {
          this.horarios = this.filtrarHorariosDisponibles(horario.horaInicio, horario.horaFin, reservados);
        });
    } else {
      this.horarios = [];
    }
  }

  obtenerTurnosReservados(dia: string, fecha: string): Observable<string[]> {
    return this.firestore.collection('turnos', ref => ref.where('fecha', '==', `${dia}, ${fecha}`))
      .valueChanges()
      .pipe(
        map((turnos: any[]) => turnos.map(turno => turno.horario))
      );
  }

  filtrarHorariosDisponibles(horaInicio: string, horaFin: string, horariosReservados: string[]): string[] {
    const turnos: string[] = [];
    let [inicioHora, inicioMinuto] = horaInicio.split(':').map(Number);
    let [finHora, finMinuto] = horaFin.split(':').map(Number);

    let inicioTotalMinutos = inicioHora * 60 + inicioMinuto;
    const finTotalMinutos = finHora * 60 + finMinuto;

    while (inicioTotalMinutos + 30 <= finTotalMinutos) {
      const horas = Math.floor(inicioTotalMinutos / 60).toString().padStart(2, '0');
      const minutos = (inicioTotalMinutos % 60).toString().padStart(2, '0');
      const turno = `${horas}:${minutos}`;
      if (!horariosReservados.includes(turno)) {
        turnos.push(turno);
      }
      inicioTotalMinutos += 30;
    }

    return turnos;
  }

}
