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
  selector: 'm-chart-control-select-value-field',
  templateUrl: 'chart-control-select-value-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectValueFieldComponent {
  chartTypeEnum = api.ChartTypeEnum;

  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() selectValueFieldChange = new EventEmitter();

  constructor() {}

  valueFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      value_field: ev.value
    });

    this.selectValueFieldChange.emit(this.chart);
  }
}
