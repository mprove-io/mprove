import { Component, Input } from '@angular/core';

import type { MconfigField } from '#common/types/backend/parts/mconfig/mconfig-field';
import { QDataRow } from '#front/app/services/data.service';

@Component({
  standalone: false,
  selector: 'm-chart-table',
  templateUrl: './chart-table.component.html'
})
export class ChartTableComponent {
  @Input()
  isTableHeaderWide: boolean;

  @Input()
  isFormat: boolean;

  @Input()
  mconfigFields: MconfigField[];

  @Input()
  qData: QDataRow[];

  constructor() {}
}
