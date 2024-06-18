import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaEspanol',
  standalone: true
})
export class DateEspañolPipe implements PipeTransform {
  transform(value: Date): string {
    const diasDeLaSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const mesesDelAno = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    const diaSemana = diasDeLaSemana[value.getDay()];
    const dia = value.getDate();
    const mes = mesesDelAno[value.getMonth()];
    const ano = value.getFullYear();

    return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
  }

}
