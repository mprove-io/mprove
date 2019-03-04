import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import * as api from '@app/api/_index';
import * as uuid from 'uuid';
import { MColorChange } from '@app/modules/colorpicker/colorpicker';

@Component({
  moduleId: module.id,
  selector: 'm-chart-number-card',
  templateUrl: 'chart-number-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartNumberCardComponent {
  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  @Output() partChange = new EventEmitter();

  innerPaddingValid: boolean;

  constructor() {}

  emitPartChange(chart) {
    this.chart = chart;

    setTimeout(() => {
      this.partChange.emit({
        is_part_valid: this.chart.y_field && this.innerPaddingValid,
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

  innerPaddingChange(ev) {
    this.innerPaddingValid = ev.innerPaddingValid;
    if (ev.chart) {
      this.emitPartChange(ev.chart);
    }
  }

  bandColorChange(ev: MColorChange) {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      band_color: ev.color
    });

    this.emitPartChange(chart);
  }

  cardColorChange(ev: any) {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      card_color: ev.color
    });

    this.emitPartChange(chart);
  }

  textColorChange(ev: MColorChange) {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      text_color: ev.color
    });

    this.emitPartChange(chart);
  }

  emptyColorChange(ev: MColorChange) {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      empty_color: ev.color
    });

    this.emitPartChange(chart);
  }
}
