import { Component, Input } from '@angular/core';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';

@Component({
  standalone: false,
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
  isWrap: boolean;

  @Input()
  rowId: string;

  @Input()
  showMetricsModelName: boolean;

  @Input()
  showMetricsTimeFieldName: boolean;

  @Input()
  partNodeLabel: string;

  @Input()
  connectionType: ConnectionTypeEnum;

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
