import { Component, Input } from '@angular/core';
import { ColumnField } from '~front/app/queries/mconfig.query';
import { RData } from '~front/app/services/query.service';

@Component({
  selector: 'm-chart',
  templateUrl: './chart.component.html'
})
export class ChartComponent {
  @Input()
  isFormat = true;

  @Input()
  sortedColumns: ColumnField[];

  @Input()
  qData: RData[];

  constructor() {}
}
