import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-tree-icon',
  templateUrl: 'tree-icon.component.html'
})
export class TreeIconComponent {
  @Input()
  isFlat: boolean;

  constructor() {}
}
