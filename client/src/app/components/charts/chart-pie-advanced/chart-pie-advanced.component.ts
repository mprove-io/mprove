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
  selector: 'm-chart-pie-advanced',
  templateUrl: 'chart-pie-advanced.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartPieAdvancedComponent {
  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() partChange = new EventEmitter();

  constructor() {}

  emitPartChange(chart) {
    this.chart = chart;

    setTimeout(() => {
      this.partChange.emit({
        is_part_valid: this.chart.x_field && this.chart.y_field,
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

  toggleGradient() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      gradient: !this.chart.gradient // !
    });

    this.emitPartChange(chart);
  }

  toggleTooltipDisabled() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      tooltip_disabled: !this.chart.tooltip_disabled // !
    });
    this.emitPartChange(chart);
  }
}
