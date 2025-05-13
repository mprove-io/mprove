import { Component, Input } from '@angular/core';
import { QDataRow } from '~front/app/services/data.service';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
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
  mconfigFields: common.MconfigField[];

  @Input()
  hideColumns: string[];

  @Input()
  qData: QDataRow[];

  @Input()
  pageSize: number;

  constructor() {}
}
