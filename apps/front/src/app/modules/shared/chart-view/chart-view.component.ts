import { Component, Input } from '@angular/core';
import { ColumnField } from '~front/app/queries/mconfig.query';
import { RData } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-view',
  templateUrl: './chart-view.component.html'
})
export class ChartViewComponent {
  chartTypeEnum = common.ChartTypeEnum;
  queryStatusEnum = common.QueryStatusEnum;

  @Input()
  sortedColumns: ColumnField[];

  @Input()
  qData: RData[];

  @Input()
  chart: common.Chart;

  @Input()
  queryStatus: common.QueryStatusEnum;

  constructor() {}

  onSelect(event: any) {}
}
