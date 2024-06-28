import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CrearAdministradorComponent } from '../../auth/crear-administrador/crear-administrador.component';
import { SweetAlertService } from '../../../services/sweetAlert.service';
import { isArrayLike } from 'rxjs/internal/util/isArrayLike';
import { ListarHistorialClinicoComponent } from '../../historial-clinico/listar-historial-clinico/listar-historial-clinico.component';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrearAdministradorComponent, ListarHistorialClinicoComponent],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.scss',
})
export class SeccionUsuariosComponent {
  users$!: Observable<any[]>;

  mostrarForm:boolean = false;

  historialUsuarioID:any;

  constructor(
    private firestoreSvc: FirestoreService,
    private sweetalert:SweetAlertService
  ) {}

  ngOnInit(): void {
    this.users$ = this.firestoreSvc.getDocuments('users');
  }

  toggleHabilitacion(user: any, bol: boolean) {
    user.verificadoAdmin = bol;
    this.firestoreSvc.updateDocument('users', user.id, user);
  }

  crearAdministrador(){
    this.mostrarForm = !this.mostrarForm;
  }

  seCreoAdmin(event:any){
    if (event) {
      this.mostrarForm = !event;
      this.sweetalert.showSuccessAlert("Se subió con éxito el producto", "Éxito", "success");
    } else {
      this.mostrarForm = false;
      this.sweetalert.showSuccessAlert("Se cancelo o no se pudo crear el usuario", "Error", "error");
    }
  }

  mostrarEspecialidades(especialidades:any) : string {
    let retorno = "";
    if (Array.isArray(especialidades)) {
      especialidades.forEach((especialidad:any) => {
        retorno += especialidad.nombre + ", ";
      });
    } else {
      retorno = especialidades;
    }
    return retorno;
  }
}
