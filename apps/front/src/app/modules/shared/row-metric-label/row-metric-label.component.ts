import { Component, Input } from '@angular/core';

@Component({
  selector: 'm-row-metric-label',
  templateUrl: './row-metric-label.component.html'
})
export class RowMetricLabelComponent {
  @Input()
  name: string;

  @Input()
  isMetric: boolean;

  @Input()
  isAddPrefixRowId: boolean;

  @Input()
  rowId: string;

  @Input()
  showMetricsModelName: boolean;

  @Input()
  showMetricsTimeFieldName: boolean;

  @Input()
  partNodeLabel: string;

  @Input()
  partFieldLabel: string;

  @Input()
  timeNodeLabel: string;

  @Input()
  timeFieldLabel: string;

  @Input()
  topLabel: string;

  constructor() {}
}
