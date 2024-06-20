import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ver-encuesta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-encuesta.component.html',
  styleUrl: './ver-encuesta.component.scss'
})
export class VerEncuestaComponent {
  @Input() encuestaId!: string;
  @Output() cerrarEncuesta = new EventEmitter();
  
  encuesta$!: Observable<any>;

  constructor(private bdSvc: FirestoreService) { }

  ngOnInit(): void {
    this.encuesta$ = this.bdSvc.getDocument('encuestas', this.encuestaId);
  }
}
