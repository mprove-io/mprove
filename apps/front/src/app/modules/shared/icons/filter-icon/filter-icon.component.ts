import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-filter-icon',
  templateUrl: 'filter-icon.component.html'
})
export class FilterIconComponent {
  @Input()
  isFilled: boolean;

  constructor() {}
}
