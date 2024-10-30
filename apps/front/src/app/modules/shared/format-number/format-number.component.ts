import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-format-number',
  templateUrl: './format-number.component.html'
})
export class FormatNumberComponent {
  @Input()
  inputItem: any;

  @Input()
  isOption: boolean;

  constructor() {}
}
