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
  selector: 'm-chart-control-select-scheme-type',
  templateUrl: 'chart-control-select-scheme-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectSchemeTypeComponent {
  chartSchemeTypeEnum = api.ChartSchemeTypeEnum;

  @Input() chart: api.Chart;
  @Output() selectSchemeTypeChange = new EventEmitter();

  constructor() {}

  schemeTypeChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      scheme_type: ev.value
    });

    this.selectSchemeTypeChange.emit(this.chart);
  }
}
