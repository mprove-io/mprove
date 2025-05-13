import { Component, Input } from '@angular/core';
import { QDataRow } from '~front/app/services/data.service';
import { common } from '~front/barrels/common';

@Component({
  standalone: false,
  selector: 'm-chart-single',
  templateUrl: './chart-single.component.html'
})
export class ChartSingleComponent {
  @Input()
  mconfigFields: common.MconfigField[];

  @Input()
  yFieldColumn: common.MconfigField;

  @Input()
  qData: QDataRow[];

  @Input()
  isFormat: boolean;

  constructor() {}
}
