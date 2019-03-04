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
  selector: 'm-chart-gauge-linear',
  templateUrl: 'chart-gauge-linear.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartGaugeLinearComponent {
  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() partChange = new EventEmitter();

  unitsValid: boolean;
  minValid: boolean;
  maxValid: boolean;

  constructor() {}

  emitPartChange(chart) {
    this.chart = chart;

    setTimeout(() => {
      this.partChange.emit({
        is_part_valid:
          this.chart.value_field &&
          this.minValid &&
          this.maxValid &&
          this.unitsValid,
        chart: chart
      });
    }, 0);
  }

  toggleAnimations() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      animations: !this.chart.animations // !
    });
    this.emitPartChange(chart);
  }

  minChange(ev) {
    this.minValid = ev.minValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }

  maxChange(ev) {
    this.maxValid = ev.maxValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }

  unitsChange(ev) {
    this.unitsValid = ev.unitsValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }
}
