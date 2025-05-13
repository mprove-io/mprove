import { Component, Input } from '@angular/core';

@Component({
  standalone: false,
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
