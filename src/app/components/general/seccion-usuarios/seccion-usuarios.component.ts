import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CrearAdministradorComponent } from '../../auth/crear-administrador/crear-administrador.component';

@Component({
  selector: 'app-seccion-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CrearAdministradorComponent],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.scss',
})
export class SeccionUsuariosComponent {
  users$!: Observable<any[]>;

  constructor(
    private firestoreSvc: FirestoreService,
    private authSvc: AuthService
  ) {}

  ngOnInit(): void {
    this.users$ = this.firestoreSvc.getDocuments('users');
  }

  toggleHabilitacion(user: any, bol: boolean) {
    user.verificadoAdmin = bol;
    this.firestoreSvc.updateDocument('users', user.id, user);
  }

  crearAdministrador(){
    
  }
}
