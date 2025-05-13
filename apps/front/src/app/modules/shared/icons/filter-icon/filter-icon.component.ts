import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
  selector: 'm-filter-icon',
  templateUrl: 'filter-icon.component.html'
})
export class FilterIconComponent {
  @Input()
  isFilled: boolean;

  constructor() {}
}
