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

  verHistorial(historialClinico:any):void {
    
  }
}
