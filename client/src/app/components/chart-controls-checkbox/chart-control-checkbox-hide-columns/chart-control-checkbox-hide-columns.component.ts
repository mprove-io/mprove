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
  selector: 'm-chart-control-checkbox-hide-columns',
  templateUrl: 'chart-control-checkbox-hide-columns.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlCheckboxHideColumnsComponent {
  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() checkboxHideColumnsChange = new EventEmitter();

  constructor() {}

  hideColumnsIsSelected(id: string) {
    return this.chart.hide_columns.findIndex(x => x === id) > -1;
  }

  hideColumnsOnClick(id: string) {
    let index = this.chart.hide_columns.findIndex(x => x === id);

    let chart;

    if (index > -1) {
      chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        hide_columns: [
          ...this.chart.hide_columns.slice(0, index),
          ...this.chart.hide_columns.slice(index + 1)
        ]
      });
    } else {
      chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        hide_columns: [...this.chart.hide_columns, id]
      });
    }

    this.chart = chart;

    this.checkboxHideColumnsChange.emit(this.chart);
  }
}
