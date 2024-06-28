import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { CrearAdministradorComponent } from '../../auth/crear-administrador/crear-administrador.component';
import { SweetAlertService } from '../../../services/sweetAlert.service';
import { ListarHistorialClinicoComponent } from '../../historial-clinico/listar-historial-clinico/listar-historial-clinico.component';
import { ExcelDownloadGenericService } from '../../../services/excel-download.service';


@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrearAdministradorComponent, ListarHistorialClinicoComponent],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.scss',
 
})
export class SeccionUsuariosComponent {
  users$!: any;

  mostrarForm:boolean = false;

  historialUsuarioID:any;

  constructor(
    private firestoreSvc: FirestoreService,
    private sweetalert:SweetAlertService,
    private excelSvc: ExcelDownloadGenericService
  ) {}

  ngOnInit(): void {
    this.firestoreSvc.getDocuments('users').subscribe(data => {
      this.users$ = data;
    });
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

  descargarUsuariosExcel(): void {
    this.excelSvc.descargarExcel(this.users$, "Lista-de-usuarios", "Lista-de-usuarios");
  }

  descargarUsuarioExcel(usuario: any): void {
    let data:any;
    switch (usuario.userType) {
      case "paciente":
        this.firestoreSvc.getDocumentsWhere("turnos", "paciente", usuario.id).subscribe((turnos:any) => {
          this.excelSvc.descargarExcel(turnos, `Datos_${usuario.nombre}_${usuario.apellido}`, `Datos_${usuario.nombre}_${usuario.apellido}`);
        });
        break;
      case "especialista":
        data = [
          ["Nombre", usuario.nombre],
          ["Apellido", usuario.apellido],
          ["Edad", usuario.edad.toString()],
          ["Especialidades", this.mostrarEspecialidades(usuario.especialidad)],
          ["Tipo", usuario.userType],
          ["Email", usuario.email],
          ["Verificada por admin", usuario.verificadoAdmin]
        ]
        this.excelSvc.descargarExcel(data, `Datos_${usuario.nombre}_${usuario.apellido}`, `Datos_${usuario.nombre}_${usuario.apellido}`);
        break;
      case "admin":
        data = [
          ["Nombre", usuario.nombre],
          ["Apellido", usuario.apellido],
          ["Edad", usuario.edad.toString()],
          ["Tipo", usuario.userType],
          ["Email", usuario.email]
        ]
        this.excelSvc.descargarExcel(data, `Datos_${usuario.nombre}_${usuario.apellido}`, `Datos_${usuario.nombre}_${usuario.apellido}`);
        break;
    }
  }

}
