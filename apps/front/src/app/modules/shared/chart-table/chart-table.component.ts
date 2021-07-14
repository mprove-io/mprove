import { Component, Input } from '@angular/core';
import { ColumnField } from '~front/app/queries/mconfig.query';
import { RData } from '~front/app/services/query.service';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-chart-table',
  templateUrl: './chart-table.component.html'
})
export class ChartTableComponent {
  fieldClassDimension = common.FieldClassEnum.Dimension;
  fieldClassMeasure = common.FieldClassEnum.Measure;
  fieldClassCalculation = common.FieldClassEnum.Calculation;

  fieldResultNumber = common.FieldResultEnum.Number;

  @Input()
  isFormat: boolean;

  @Input()
  sortedColumns: ColumnField[];

  @Input()
  hideColumns: string[];

  @Input()
  qData: RData[];

  @Input()
  pageSize: number;

  constructor() {}
}
