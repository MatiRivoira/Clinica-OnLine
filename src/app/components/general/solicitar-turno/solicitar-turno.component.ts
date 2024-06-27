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

  especialidades:any[] = [
    { id: 1, nombre: 'Cardiología', imagen: 'img/cardiologia.png' },
    { id: 2, nombre: 'Dermatología', imagen: 'img/dermatologia.png' },
    { id: 3, nombre: 'Endocrinología', imagen: 'img/endocrinologia.png' },
    { id: 4, nombre: 'Gastroenterología', imagen: 'img/gastroenterologia.png' },
    { id: 5, nombre: 'Ginecología', imagen: 'img/ginecologia.png' },
    { id: 6, nombre: 'Neurología', imagen: 'img/neurologia.png' },
    { id: 7, nombre: 'Odontología', imagen: '' },
    { id: 8, nombre: 'Oftalmología', imagen: 'img/oftalmologia.png' },
    { id: 9, nombre: 'Otra', imagen: 'otra' }
  ];

  paso:string = "Selecciona una especialidad";

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

  pacienteSeleccionado:any;
  errMsg: string = "";
  solicitarTurno(): void {
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
    if (this.especialidadSeleccionada === "Otra") {
      especialidad = this.otraEspecialidadSeleccionada;
    }
    var userID = this.user.id;
    if (this.user.userType === "admin"){
      userID = this.pacienteSeleccionado;
    }
    if (this.especialidad && this.especialistaSeleccionado && this.fechaSeleccionada && this.horarioSeleccionado) {
      this.firestoreSvc.addDocument("turnos", {
        especialidad: especialidad,
        especialista: this.especialistaSeleccionado,
        fecha: this.fechaSeleccionada,
        horario: this.horarioSeleccionado,
        paciente: userID,
        estado: 'Pendiente'
      }).then(() => {
        this.isLoading = false;
        this.sweetAlert.showSuccessAlert("Se subió con éxito el producto", "Éxito", "success");

        this.paso = "Selecciona una especialidad";
        this.especialidad = "";
        this.horarioSeleccionado = "";
        this.especialistaSeleccionado = '';
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
      // if (!formularioTurno.form.value.especialidad) {
      //   this.errorStates.especialidad = true;
      //   this.errMsg = "Complete todos los campos";
      // }
      // if (!formularioTurno.form.value.especialista) {
      //   this.errorStates.especialista = true;
      //   this.errMsg = "Complete todos los campos";
      // }
      // if (!formularioTurno.form.value.fecha) {
      //   this.errorStates.fecha = true;
      //   this.errMsg = "Complete todos los campos";
      // }
      // if (!formularioTurno.form.value.horario) {
      //   this.errorStates.horario = true;
      //   this.errMsg = "Complete todos los campos";
      // }
      // if (!formularioTurno.form.value.paciente && this.user.userType === "admin") {
      //   this.errorStates.paciente = true;
      //   this.errMsg = "Complete todos los campos";
      // }
      this.isLoading = false;
    }
  }

  otraEspecialidad: boolean = false;
  @ViewChild('especialidadPersonalizadaInput') especialidadPersonalizadaInput!: ElementRef;

  async onEspecialidadChange(event: any) {
    this.especialidadSeleccionada = event;
    
    this.otraEspecialidad = this.especialidadSeleccionada === 'Otra';
    if (this.otraEspecialidad) {
      setTimeout(() => {
        this.especialidadPersonalizadaInput.nativeElement.focus();
      }, 100);
    } else {
      this.isLoading = true;
      this.otraEspecialidadSeleccionada = "";
      await this.firestoreSvc.getDocumentsWhereArrayElementMatches("users", "especialidad", "nombre", this.especialidadSeleccionada).subscribe(especialistas => {
        this.especialistas = especialistas;
      })
      this.isLoading = false;
      this.paso = "Seleccione un especialista";
    }
  }

  inputOtra:any;
  onOtraEspecialidadChange() {
    this.otraEspecialidadSeleccionada = this.inputOtra;
    if (this.inputOtra) {
      this.firestoreSvc.getDocumentsWhereArrayElementMatches("users", "especialidad", "nombre", this.otraEspecialidadSeleccionada).subscribe(especialistas => {
        this.especialistas = especialistas;
      })
      this.otraEspecialidad = false;
      this.paso = "Seleccione un especialista";
    } else {
      this.sweetAlert.showSuccessAlert("Ingrese la especialidad", "Error", "error");
    }
  }
  
 

  especialidad:any;
  especialistaAux:any;
  onEspecialistaChange($event:any): void {
    this.fechasDisponibles = [];
    this.especialistaSeleccionado = $event;
    var auxespecialidad:any = this.especialidadSeleccionada;
    if (this.especialidadSeleccionada === "Otra") {
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
    this.paso = "Seleccione una fecha";
  }

  obtenerFechasProximas(diasSemana: string[]): Date[] {
    const diasDeLaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
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
    const formatearFecha = this.trasnformarFecha(fecha);
    const diaSeleccionado = formatearFecha.split(",")[0]; // Obteniendo el día en formato "09"
    const horario = this.especialidad.horarios.find((horario: any) => horario.dia === diaSeleccionado);
    
    if (horario) {
        this.obtenerTurnosReservados(formatearFecha)
        .subscribe((reservados: any) => {
          this.horarios = this.filtrarHorariosDisponibles(horario.horaInicio, horario.horaFin, reservados);
        });
        this.fechaSeleccionada = formatearFecha;
        this.paso = "Seleccione un horario";
    } else {
        this.horarios = [];
    }
}

trasnformarFecha(fecha:Date):string {
  const diasDeLaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const mesesDelAno = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  const diaSemana = diasDeLaSemana[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = mesesDelAno[fecha.getMonth()];
  const ano = fecha.getFullYear();

  return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
}


  obtenerTurnosReservados(fecha: string): Observable<string[]> {
    return this.firestore.collection('turnos', ref =>
      ref.where('fecha', '==', `${fecha}`)
         .where('estado', '!=', 'Cancelado')
    ).valueChanges()
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

  horarioSeleccionado:any;
  onHorarioSelected(horario:any):void {
    this.horarioSeleccionado = horario;
    this.paso = "Confirme su turno";
  }

  atrasPaso(){
    switch (this.paso) {
      case "Confirme su turno":
        this.paso = "Seleccione un horario";
        this.horarioSeleccionado = "";
        break;
      case "Seleccione un horario":
        this.paso = "Seleccione una fecha";
        this.fechaSeleccionada = ""
        break;
      case "Seleccione una fecha":
        this.paso = "Seleccione un especialista";
        this.especialistaSeleccionado = "";
        break;
      case "Seleccione un especialista":
        this.paso = "Selecciona una especialidad";
        this.especialidadSeleccionada = "";
        this.especialidad = "";
        break;
    }
  }
}
