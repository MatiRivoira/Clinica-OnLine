import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCopyToClipboard]',
  standalone: true
})
export class CopyToClipboardDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click')
  onClick() {
    // Obtener el contenido del elemento al que se aplica la directiva
    const text = this.el.nativeElement.innerText.trim();

    // Crear un elemento auxiliar para copiar al portapapeles
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    document.body.appendChild(tempInput);

    // Seleccionar y copiar el texto
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Mostrar un mensaje o realizar alguna acción adicional si es necesario
    console.log('Texto copiado al portapapeles: ' + text);
  }

}
