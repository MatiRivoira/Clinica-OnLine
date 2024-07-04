import { Component, inject } from '@angular/core';
import { ConfirmLogoutDirective } from '../../../directives/confirm-logout.directive';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [ConfirmLogoutDirective],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss'
})
export class ConfiguracionComponent {
}
