import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as api from '@app/api/_index';
import * as uuid from 'uuid';

@Component({
  moduleId: module.id,
  selector: 'm-chart-table',
  templateUrl: 'chart-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartTableComponent {
  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() partChange = new EventEmitter();

  pageSizeValid: boolean;

  constructor() {}

  pageSizeChange(ev) {
    this.pageSizeValid = ev.pageSizeValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }

  emitPartChange(chart) {
    this.chart = chart;

    setTimeout(() => {
      this.partChange.emit({
        is_part_valid: this.pageSizeValid,
        chart: chart
      });
    }, 0);
  }
}
