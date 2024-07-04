import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Directive({
  selector: '[appConfirmLogout]',
  standalone: true
})
export class ConfirmLogoutDirective {

  authService = inject(AuthService);

  constructor() { }

  @HostListener('click', ['$event'])
  confirmLogout(event: MouseEvent): void {
    event.stopPropagation();

    Swal.fire({
      title: 'Cerrar sesión',
      text: '¿Está seguro que desea cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logOut();
      }
    });

    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
