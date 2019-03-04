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
  selector: 'm-chart-control-select-tile-width',
  templateUrl: 'chart-control-select-tile-width.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectTileWidthComponent {
  chartTileWidthEnum = api.ChartTileWidthEnum;

  @Input() chart: api.Chart;
  @Output() selectTileWidthChange = new EventEmitter();

  constructor() {}

  tileWidthChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      tile_width: ev.value
    });

    this.selectTileWidthChange.emit(this.chart);
  }
}
