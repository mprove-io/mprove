import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'm-panel-title',
  templateUrl: './panel-title.component.html'
})
export class PanelTitleComponent {
  @Input()
  title: string;

  @Input()
  isExpanded: boolean;

  @Output()
  toggleEvent = new EventEmitter();

  constructor() {}

  toggle() {
    this.toggleEvent.emit();
  }
}
