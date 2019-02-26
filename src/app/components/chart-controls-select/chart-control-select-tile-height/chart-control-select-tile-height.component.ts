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
  selector: 'm-chart-control-select-tile-height',
  templateUrl: 'chart-control-select-tile-height.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlSelectTileHeightComponent {
  chartTileHeightEnum = api.ChartTileHeightEnum;

  @Input() chart: api.Chart;
  @Output() selectTileHeightChange = new EventEmitter();

  constructor() {}

  tileHeightChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      tile_height: ev.value
    });

    this.selectTileHeightChange.emit(this.chart);
  }
}
