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
  selector: 'm-chart-control-select-view-size',
  templateUrl: 'chart-control-select-view-size.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectViewSizeComponent {
  chartViewSizeEnum = api.ChartViewSizeEnum;

  @Input() chart: api.Chart;
  @Output() selectViewSizeChange = new EventEmitter();

  constructor() {}

  viewSizeChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      view_size: ev.value
    });

    this.selectViewSizeChange.emit(this.chart);
  }
}
