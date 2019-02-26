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
  selector: 'm-chart-control-select-interpolation',
  templateUrl: 'chart-control-select-interpolation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectInterpolationComponent {
  chartInterpolationEnum = api.ChartInterpolationEnum;

  @Input() chart: api.Chart;
  @Output() selectInterpolationChange = new EventEmitter();

  constructor() {}

  interpolationChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      interpolation: ev.value
    });

    this.selectInterpolationChange.emit(this.chart);
  }
}
