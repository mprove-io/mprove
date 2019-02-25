import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as api from '@app/api/_index';
import * as enums from '@app/enums/_index';
import * as uuid from 'uuid';

import { MatSelectChange } from '@angular/material';

@Component({
  moduleId: module.id,
  selector: 'm-chart-control-select-x-field',
  templateUrl: 'chart-control-select-x-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectXFieldComponent {
  chartTypeEnum = api.ChartTypeEnum;

  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() selectXFieldChange = new EventEmitter();

  constructor() {}

  xFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      x_field: ev.value
    });

    this.selectXFieldChange.emit(this.chart);
  }
}
