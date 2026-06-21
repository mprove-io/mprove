import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-star-icon',
  templateUrl: 'star-icon.component.html'
})
export class StarIconComponent {
  @Input()
  isFilled: boolean;

  constructor() {}
}
