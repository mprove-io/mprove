import { Component, Input } from '@angular/core';
import { QDataRow } from '~front/app/services/data.service';

@Component({
  standalone: false,
  selector: 'm-chart-single',
  templateUrl: './chart-single.component.html'
})
export class ChartSingleComponent {
  @Input()
  mconfigFields: MconfigField[];

  @Input()
  yFieldColumn: MconfigField;

  @Input()
  qData: QDataRow[];

  @Input()
  isFormat: boolean;

  constructor() {}
}
