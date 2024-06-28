import { CommonModule } from '@angular/common';
import { Component, Input, inject, input } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { SweetAlertService } from '../../../services/sweetAlert.service';
import { EncuestaAtencionComponent } from '../../encuesta-atencion/encuesta-atencion.component';
import { VerEncuestaComponent } from '../../ver-encuesta/ver-encuesta.component';
import { AltaHistorialClinicoComponent } from '../../historial-clinico/alta-historial-clinico/alta-historial-clinico.component';
import { VerHistorialClinicoComponent } from '../../historial-clinico/ver-historial-clinico/ver-historial-clinico.component';

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, EncuestaAtencionComponent, VerEncuestaComponent, AltaHistorialClinicoComponent, VerHistorialClinicoComponent],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.scss',
})
export class MisTurnosComponent {
  turnos: any[] = [];
  turnosFiltrados: any[] = [];

  filtro: string = '';

  isAdmin: boolean = false;

  reseniaSeleccionada:any;

  encuestaAtecion: boolean = false;
  turnoSeleccionado:boolean = false; // boolean 

  altaHistorialClinico:boolean = false; // boolean
  turnoSeleccionadoFinal:any;

  encuestaSeleccionada :string = '';

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


  calificarAtencion(turno: any): void {
    this.sweetAlert.showPrompt(`Calificar turno`, 'Por favor, deja un comentario sobre el turno.')
      .then(result => {
        if (result.isConfirmed && result.value) {
          this.firestoreSvc.updateDocument('turnos', turno.id, { comentario: result.value })
            .then(() => {
              this.sweetAlert.showSuccessAlert(`El turno ha sido calificado.`, "Calificado", 'success');
              this.cargarTurnos();  
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
    this.turnoSeleccionadoFinal = turno;
    this.altaHistorialClinico = true;
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

  verEncuesta(encuestaId:string) : void {
    this.encuestaSeleccionada = encuestaId;
  }

  mostrarHistoriaClinica(historiaClinica:any) : string {
    let retorno = "";
    if(historiaClinica){
      retorno = `Altura: ${historiaClinica.altura} <br> Peso: ${historiaClinica.peso} <br> Presión: ${historiaClinica.presion} <br> Temperatura: ${historiaClinica.temperatura}`;
      if(historiaClinica.datosDinamicos){
        historiaClinica.datosDinamicos.forEach((dato:any) => {
          retorno += `<br> ${dato.clave}: ${dato.valor}`;
        });
      }
    }
    return retorno;
  }
}
