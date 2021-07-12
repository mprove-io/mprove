import { Component, Input } from '@angular/core';
import { ColumnField } from '~front/app/queries/mconfig.query';
import { RData } from '~front/app/services/query.service';

@Component({
  selector: 'm-chart-view',
  templateUrl: './chart-view.component.html'
})
export class ChartViewComponent {
  @Input()
  sortedColumns: ColumnField[];

  @Input()
  qData: RData[];

  constructor() {}
}
