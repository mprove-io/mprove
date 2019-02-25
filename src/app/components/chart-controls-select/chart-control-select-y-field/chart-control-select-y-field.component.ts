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
  selector: 'm-chart-control-select-y-field',
  templateUrl: 'chart-control-select-y-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectYFieldComponent {
  chartTypeEnum = api.ChartTypeEnum;

  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() selectYFieldChange = new EventEmitter();

  constructor() {}

  yFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      y_field: ev.value
    });

    this.selectYFieldChange.emit(this.chart);
  }
}
