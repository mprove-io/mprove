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
  selector: 'm-chart-gauge',
  templateUrl: 'chart-gauge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartGaugeComponent {
  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() partChange = new EventEmitter();

  legendTitleValid: boolean;
  angleSpanValid: boolean;
  startAngleValid: boolean;
  bigSegmentsValid: boolean;
  smallSegmentsValid: boolean;
  minValid: boolean;
  maxValid: boolean;
  unitsValid: boolean;

  constructor() {}

  emitPartChange(chart) {
    this.chart = chart;

    setTimeout(() => {
      this.partChange.emit({
        is_part_valid:
          this.chart.x_field &&
          this.chart.y_field &&
          this.legendTitleValid &&
          this.angleSpanValid &&
          this.startAngleValid &&
          this.bigSegmentsValid &&
          this.smallSegmentsValid &&
          this.minValid &&
          this.maxValid &&
          this.unitsValid,
        chart: chart
      });
    }, 0);
  }

  toggleShowAxis() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_axis: !this.chart.show_axis // !
    });
    this.emitPartChange(chart);
  }

  toggleAnimations() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      animations: !this.chart.animations // !
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

  angleSpanChange(ev) {
    this.angleSpanValid = ev.angleSpanValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }

  startAngleChange(ev) {
    this.startAngleValid = ev.startAngleValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }

  bigSegmentsChange(ev) {
    this.bigSegmentsValid = ev.bigSegmentsValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }

  smallSegmentsChange(ev) {
    this.smallSegmentsValid = ev.smallSegmentsValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
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
