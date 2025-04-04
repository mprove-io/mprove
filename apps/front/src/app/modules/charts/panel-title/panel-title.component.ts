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

  @Input()
  showToggle: boolean;

  @Output()
  toggleEvent = new EventEmitter();

  constructor() {}

  toggle() {
    if (this.showToggle === true) {
      this.toggleEvent.emit();
    }
  }
}
