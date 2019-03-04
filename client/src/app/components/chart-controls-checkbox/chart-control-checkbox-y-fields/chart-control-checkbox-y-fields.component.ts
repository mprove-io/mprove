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
  selector: 'm-chart-control-checkbox-y-fields',
  templateUrl: 'chart-control-checkbox-y-fields.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartControlCheckboxYFieldsComponent {
  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() checkboxYFieldsChange = new EventEmitter();

  constructor() {}

  yFieldsIsSelected(id: string) {
    return this.chart.y_fields.findIndex(x => x === id) > -1;
  }

  yFieldsOnClick(id: string) {
    let index = this.chart.y_fields.findIndex(x => x === id);

    let chart;

    if (index > -1) {
      chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_fields: [
          ...this.chart.y_fields.slice(0, index),
          ...this.chart.y_fields.slice(index + 1)
        ]
      });
    } else {
      chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_fields: [...this.chart.y_fields, id]
      });
    }

    this.chart = chart;

    this.checkboxYFieldsChange.emit(this.chart);
  }
}
