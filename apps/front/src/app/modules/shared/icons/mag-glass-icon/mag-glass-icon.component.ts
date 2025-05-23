import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-mag-glass-icon',
  templateUrl: 'mag-glass-icon.component.html'
})
export class MagGlassIconComponent {
  @Input()
  isFilled: boolean;

  constructor() {}
}
