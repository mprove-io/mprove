import { Component, Input } from '@angular/core';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-wrapper',
  templateUrl: './chart-wrapper.component.html'
})
export class ChartWrapperComponent {
  @Input()
  report: common.Report;

  constructor() {}
}
