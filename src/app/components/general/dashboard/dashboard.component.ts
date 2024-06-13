import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  {
  @Input() user:any;
  @Output() click = new EventEmitter<any>();

  handleClick(event: Event, action?: string) {
    event.stopPropagation();
    if (action) {
      this.click.emit(action);
    }
  }
}
