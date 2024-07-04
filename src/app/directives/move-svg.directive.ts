import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appMoveSVG]',
  standalone: true
})
export class MoveSVGDirective {

  @HostBinding('class.animate') isHovered = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.isHovered = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.isHovered = false;
  }

}
