import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as api from '@app/api/_index';
import * as uuid from 'uuid';

import { MatSelectChange } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-chart-control-select-multi-field',
  templateUrl: 'chart-control-select-multi-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectMultiFieldComponent {
  chartTypeEnum = api.ChartTypeEnum;

  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() selectMultiFieldChange = new EventEmitter();

  constructor() {}

  multiFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      multi_field: ev.value
    });

    this.selectMultiFieldChange.emit(this.chart);
  }
}
