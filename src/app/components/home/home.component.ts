import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { LoadingComponent } from '../loading/loading.component';
import { Router } from '@angular/router';
import { Observable, Subscription, interval, take } from 'rxjs';
import { SeccionUsuariosComponent } from '../general/seccion-usuarios/seccion-usuarios.component';
import { DashboardComponent } from '../general/dashboard/dashboard.component';
import { ConfiguracionComponent } from '../herramientas/configuracion/configuracion.component';
import { NotificacionesComponent } from '../general/notificaciones/notificaciones.component';
import { PerfilComponent } from '../herramientas/perfil/perfil.component';
import { MisTurnosComponent } from '../general/mis-turnos/mis-turnos.component';
import { SolicitarTurnoComponent } from '../general/solicitar-turno/solicitar-turno.component';
import { TurnosComponent } from '../general/turnos/turnos.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoadingComponent, 
            SeccionUsuariosComponent, 
            DashboardComponent,
            ConfiguracionComponent,
            NotificacionesComponent,
            PerfilComponent,
            MisTurnosComponent,
            SolicitarTurnoComponent,
            TurnosComponent
          ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedNavItem: string = 'dashboard';
  userType!: string;
  isLoading: boolean = false;
  authSvc = inject(AuthService);
  storeSvc = inject(FirestoreService);
  user$!: Observable<any>;
  userReal: any = { nombre: '', apellido: '', img: '' };
  retryInterval: Subscription | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    var retries = 0;
    this.user$ = this.authSvc.getUser();
    this.isLoading = true;
    this.retryInterval = interval(1000)
      .pipe(take(3))
      .subscribe(() => {
        this.user$.subscribe((user: any) => {
          if (user) {
            this.storeSvc.getDocument('users', user.uid).subscribe((doc) => {
              if (doc) {
                this.userType = doc.userType;
                this.userReal = doc;
                this.isLoading = false;
                if (this.retryInterval) {
                  this.retryInterval.unsubscribe();
                }
              }
            });
          } else {
            retries++;
            if (retries >= 3) {
              this.isLoading = false;
              this.router.navigate(['/bienvenido']);
              if (this.retryInterval) {
                this.retryInterval.unsubscribe();
              }
            }
          }
        });
      });
  }

  ngOnDestroy(): void {}

  selectNavItem(navItem: string): void {
    this.selectedNavItem = navItem;
  }
}
