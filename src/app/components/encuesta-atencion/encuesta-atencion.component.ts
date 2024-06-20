import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SweetAlertService } from '../../services/sweetAlert.service';
import { FirestoreService } from '../../services/firestore.service';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-encuesta-atencion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoadingComponent],
  templateUrl: './encuesta-atencion.component.html',
  styleUrl: './encuesta-atencion.component.scss'
})
export class EncuestaAtencionComponent {
  encuestaForm: FormGroup;
  calificacion: number = 0; // Variable para almacenar la calificación seleccionada
  hoverIndex: number = -1; // Variable para almacenar temporalmente el índice durante el hover

  isLoading:boolean = false; // boolea

  @Input() user:any;
  @Input() turno:any;
  @Output() encuestaActive = new EventEmitter();

  sweetAlert = inject(SweetAlertService);
  bdSvc = inject(FirestoreService);

  constructor(private formBuilder: FormBuilder) {
    this.encuestaForm = this.formBuilder.group({
      opinionAtencion: ['', Validators.required],
      tiempoEspera: ['', Validators.required],
      sugerencias: ['']
    });
  }

  onStarHover(index: number): void {
    this.hoverIndex = index -1;
  }

  onStarLeave(): void {
    this.hoverIndex = -1; // Reiniciar el índice durante el hover al salir
  }

  calificar(index: number): void {
    this.calificacion = index;
  }

  enviarEncuesta(): void {
    this.isLoading = true;
    if (this.encuestaForm.valid && this.calificacion > 0) {
      const formData = this.encuestaForm.value;
      this.bdSvc.addDocumentReturnID("encuestas", { paciente: this.user.id, turno: this.turno.id, calificacion: this.calificacion, opinionAtencion: formData.opinionAtencion, tiempoEspera: formData.tiempoEspera, sugerencias: formData.sugerencias })
      .then((encuestaId: string) => {
        this.bdSvc.updateDocument('turnos', this.turno.id, { encuesta: encuestaId })
          .then(() => {
              this.isLoading = false;
              this.sweetAlert.showSuccessAlert("Encuesta enviada con éxito", "Éxito", "success");
              this.encuestaActive.emit(false);
          })
          .catch(() => {
              this.isLoading = false;
              this.sweetAlert.showSuccessAlert("Hubo un error al enviar la encuesta", "Error", "error");
          });
      })
      .catch((err:any) => {
        this.isLoading = false;
        this.sweetAlert.showSuccessAlert("Hubo un error al enviar la encuesta", "Error", "error");
        console.log(err);
      });
    } else {
      this.isLoading = false;
      this.sweetAlert.showSuccessAlert("Por favor, llene todos los campos,", "Error", "error")
    }
  }
}
