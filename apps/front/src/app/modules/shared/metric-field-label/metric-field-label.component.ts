import { Component, Input } from '@angular/core';
import { ModelMetric } from '~common/interfaces/blockml/model-metric';

@Component({
  standalone: false,
  selector: 'm-metric-field-label',
  templateUrl: './metric-field-label.component.html'
})
// implements OnChanges
export class MetricFieldLabelComponent {
  @Input()
  metric: ModelMetric;

  @Input()
  isShowTop: boolean;

  @Input()
  isShowTime: boolean;

  constructor() {}

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log(changes);
  // }
}
