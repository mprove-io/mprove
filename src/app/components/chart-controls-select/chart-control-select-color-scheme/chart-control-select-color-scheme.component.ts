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
  selector: 'm-chart-control-select-color-scheme',
  templateUrl: 'chart-control-select-color-scheme.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectColorSchemeComponent {
  chartColorSchemeEnum = api.ChartColorSchemeEnum;

  @Input() chart: api.Chart;
  @Output() selectColorSchemeChange = new EventEmitter();

  constructor() {}

  colorSchemeChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      color_scheme: ev.value
    });

    this.selectColorSchemeChange.emit(this.chart);
  }
}
