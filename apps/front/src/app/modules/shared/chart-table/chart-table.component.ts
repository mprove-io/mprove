import { Component, Input } from '@angular/core';
import { QDataRow } from '~front/app/services/data.service';

@Component({
  standalone: false,
  selector: 'm-chart-table',
  templateUrl: './chart-table.component.html'
})
export class ChartTableComponent {
  fieldClassDimension = FieldClassEnum.Dimension;
  fieldClassMeasure = FieldClassEnum.Measure;
  fieldClassCalculation = FieldClassEnum.Calculation;

  fieldResultNumber = FieldResultEnum.Number;

  @Input()
  isTableHeaderWide: boolean;

  @Input()
  isFormat: boolean;

  @Input()
  mconfigFields: MconfigField[];

  @Input()
  hideColumns: string[];

  @Input()
  qData: QDataRow[];

  @Input()
  pageSize: number;

  constructor() {}
}
