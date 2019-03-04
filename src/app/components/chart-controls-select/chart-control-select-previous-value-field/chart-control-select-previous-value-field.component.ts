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
  selector: 'm-chart-control-select-previous-value-field',
  templateUrl: 'chart-control-select-previous-value-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectPreviousValueFieldComponent {
  chartTypeEnum = api.ChartTypeEnum;

  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() selectPreviousValueFieldChange = new EventEmitter();

  constructor() {}

  previousValueFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      previous_value_field: ev.value
    });

    this.selectPreviousValueFieldChange.emit(this.chart);
  }
}
