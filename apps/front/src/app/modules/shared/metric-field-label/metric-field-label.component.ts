import { Component, Input } from '@angular/core';
import type { ModelMetricX } from '#common/zod/backend/model-metric-x';

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
