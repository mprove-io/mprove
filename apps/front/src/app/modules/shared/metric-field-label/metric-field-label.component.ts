import { Component, Input } from '@angular/core';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-metric-field-label',
  templateUrl: './metric-field-label.component.html'
})
// implements OnChanges
export class MetricFieldLabelComponent {
  @Input()
  metric: common.ModelMetric;

  @Input()
  isShowTop: boolean;

  @Input()
  isShowTime: boolean;

  constructor() {}

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log(changes);
  // }
}
