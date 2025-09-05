import { Component, Input } from '@angular/core';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { MconfigField } from '~common/interfaces/backend/mconfig-field';
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

  // @Input()
  // hideColumns: string[];

  @Input()
  qData: QDataRow[];

  constructor() {}
}
