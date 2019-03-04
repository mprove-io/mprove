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
  selector: 'm-chart-pie',
  templateUrl: 'chart-pie.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartPieComponent {
  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() partChange = new EventEmitter();

  legendTitleValid: boolean;
  arcWidthValid: boolean;

  constructor() {}

  emitPartChange(chart) {
    this.chart = chart;

    setTimeout(() => {
      this.partChange.emit({
        is_part_valid:
          this.chart.x_field &&
          this.chart.y_field &&
          this.legendTitleValid &&
          this.arcWidthValid,
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

  toggleLegend() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      legend: !this.chart.legend // !
    });
    this.emitPartChange(chart);
  }

  legendTitleChange(ev) {
    this.legendTitleValid = ev.legendTitleValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }

  toggleTooltipDisabled() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      tooltip_disabled: !this.chart.tooltip_disabled // !
    });
    this.emitPartChange(chart);
  }

  toggleDoughnut() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      doughnut: !this.chart.doughnut // !
    });

    this.emitPartChange(chart);
  }

  toggleExplodeSlices() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      explode_slices: !this.chart.explode_slices // !
    });

    this.emitPartChange(chart);
  }

  toggleLabels() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      labels: !this.chart.labels // !
    });

    this.emitPartChange(chart);
  }

  arcWidthChange(ev) {
    this.arcWidthValid = ev.arcWidthValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }
}
