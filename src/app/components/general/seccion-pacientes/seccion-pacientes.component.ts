import { Component, Input, OnInit, inject } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { ListarHistorialClinicoComponent } from '../../historial-clinico/listar-historial-clinico/listar-historial-clinico.component';

@Component({
  selector: 'app-seccion-pacientes',
  standalone: true,
  imports: [CommonModule, ListarHistorialClinicoComponent],
  templateUrl: './seccion-pacientes.component.html',
  styleUrl: './seccion-pacientes.component.scss'
})
export class SeccionPacientesComponent implements OnInit {
  @Input() user: any;

  pacientes!:any;
  users:any;
  turnos:any;
  
  historialUsuarioID:any;

  bdSvc = inject(FirestoreService);

  constructor() {
    this.bdSvc.getDocumentsWhere("users", "userType", "paciente").subscribe(users => {
      this.users = users;
    });
  }

  ngOnInit(): void {
    this.bdSvc.getDocumentsWhere("turnos", "especialista", this.user.id).subscribe(turnos => {
      const idsPacientes = new Set<number>();

      this.turnos = turnos;

      // Recorrer los turnos y agregar los IDs de pacientes únicos al conjunto
      turnos.forEach(turno => {
        idsPacientes.add(turno.paciente);
      });

      // Convertir el conjunto en un array para filtrar los pacientes
      const pacientesIds = Array.from(idsPacientes);

      // Filtrar los usuarios que son pacientes atendidos por el especialista
      this.pacientes = this.users.filter((user: any) => pacientesIds.includes(user.id));
    });
  }

  mostrarUltimosTurnos(usuarioID: string): string {
    let retorno = "";
  
    // Filtrar los turnos del usuario
    let turnosUsuario = this.turnos.filter((turno:any) => turno.paciente === usuarioID && turno.estado === "Realizado");
  
    // Ordenar los turnos por fecha (asumiendo que la fecha está en formato ISO 8601)
    turnosUsuario.sort((a:any, b:any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  
    // Tomar los últimos 3 turnos
    let ultimosTresTurnos = turnosUsuario.slice(0, 3);
  
    // Formatear la información de los turnos
    ultimosTresTurnos.forEach((turno:any) => {
      retorno += `${turno.fecha} ${turno.especialidad} <br>`;
    });

    return retorno;
  }
}
