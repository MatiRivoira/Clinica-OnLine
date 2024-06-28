import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SweetAlertService } from '../../../services/sweetAlert.service';
import { FirestoreService } from '../../../services/firestore.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-alta-historial-clinico',
  standalone: true,
  imports: [FormsModule, CommonModule, LoadingComponent],
  templateUrl: './alta-historial-clinico.component.html',
  styleUrl: './alta-historial-clinico.component.scss'
})
export class AltaHistorialClinicoComponent {
  @Input() turno: any; // Recibe el turno como entrada desde el componente padre
  @Output() cerrarEncuesta = new EventEmitter();

  isLoading:boolean = false;

  resenia: string = '';
  diagnostico: string = '';
  datosClinicos = {
    altura: '',
    peso: '',
    temperatura: '',
    presion: '',
    dinamicos: [] as { clave: string, valor: string }[]
  };

  constructor(private sweetAlert: SweetAlertService, private firestoreSvc: FirestoreService) {}

  submitForm(): void {
    this.isLoading = true;
    // Validar y procesar los datos del formulario
    if (this.resenia && this.diagnostico) {
      const historialClinico = {
          altura: this.datosClinicos.altura || '',
          peso: this.datosClinicos.peso || '',
          temperatura: this.datosClinicos.temperatura || '',
          presion: this.datosClinicos.presion || '',
          datosDinamicos: this.datosClinicos.dinamicos
      };
      // Actualizar documento en Firestore con los datos finales
      this.firestoreSvc.updateDocument('turnos', this.turno.id, { estado: "Realizado", resenia: this.resenia, diagnostico: this.diagnostico, historialClinico: historialClinico})
        .then(() => {
          this.isLoading = false;
          this.sweetAlert.showSuccessAlert(`El turno ha sido finalizado.`, "Finalizado", 'success');
          this.cerrarEncuesta.emit();
        })
        .catch(error => {
          this.isLoading = false;
          this.sweetAlert.showSuccessAlert(`No se pudo finalizar el turno.`, 'Error', 'error');
          console.error(`Error al finalizar el turno:`, error);
        });
    } else {
      this.isLoading = false;
      this.sweetAlert.showSuccessAlert(`Por favor, completa todos los campos del formulario.`, 'Error', 'error');
    }
  }
  

  agregarDato(): void {
    if (this.datosClinicos.dinamicos.length < 3) {
      this.datosClinicos.dinamicos.push({ clave: '', valor: '' });
    } else {
      this.sweetAlert.showSuccessAlert(`Máximo de datos dinámicos alcanzado (3).`, 'Error', 'error');
    }
  }
}
