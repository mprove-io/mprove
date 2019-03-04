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
  selector: 'm-chart-control-select-type',
  templateUrl: 'chart-control-select-type.component.html',
  styleUrls: ['chart-control-select-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectTypeComponent {
  chartIconEnum = enums.ChartIconEnum;
  chartTypeEnum = api.ChartTypeEnum;

  @Input() chart: api.Chart;
  @Output() selectTypeChange = new EventEmitter();

  constructor() {}

  typeChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      type: ev.value
    });

    this.selectTypeChange.emit(this.chart);
  }
}
