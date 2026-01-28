import { Component, Input } from '@angular/core';
import { ModelMetricX } from '#common/interfaces/backend/model-metric-x';

@Component({
  standalone: false,
  selector: 'm-metric-field-label',
  templateUrl: './metric-field-label.component.html'
})
export class MetricFieldLabelComponent {
  @Input()
  metric: ModelMetricX;

  @Input()
  isShowTop: boolean;

  @Input()
  isShowTime: boolean;

  constructor() {}
}
