import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ver-historial-clinico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-historial-clinico.component.html',
  styleUrl: './ver-historial-clinico.component.scss'
})
export class VerHistorialClinicoComponent  {
  @Input() turno:any;
  @Output() mostrarComentario = new EventEmitter();


}
