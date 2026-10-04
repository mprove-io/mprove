import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UI_CHART_TYPES } from '#common/constants/ui-chart-types';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';

import type { MconfigChartYAxis } from '#common/types/blockml/parts/mconfig/mconfig-chart-y-axis';
import type { EventChartDeleteYAxisElement } from '#common/types/front/chart/events/event-chart-delete-y-axis-element';
import type { EventChartToggleYAxisElement } from '#common/types/front/chart/events/event-chart-toggle-y-axis-element';
import type { EventChartYAxisElementUpdate } from '#common/types/front/chart/events/event-chart-y-axis-element-update';

@Component({
  standalone: false,
  selector: 'm-chart-editor-y-axis-element',
  templateUrl: './chart-editor-y-axis-element.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartEditorYAxisElementComponent {
  @Input()
  yAxisIndex: number;

  @Input()
  yAxisElement: MconfigChartYAxis;

  @Input()
  isExpanded: boolean;

  @Input()
  chartType: ChartType;

  @Output() chartToggleYAxisElement =
    new EventEmitter<EventChartToggleYAxisElement>();

  @Output() chartDeleteYAxisElement =
    new EventEmitter<EventChartDeleteYAxisElement>();

  @Output() chartYAxisElementUpdate =
    new EventEmitter<EventChartYAxisElementUpdate>();

  uiChartTypes = UI_CHART_TYPES;

  constructor(private fb: FormBuilder) {}

  emitChartToggleYAxisElement() {
    let event: EventChartToggleYAxisElement = {
      yAxisIndex: this.yAxisIndex
    };

    this.chartToggleYAxisElement.emit(event);
  }

  emitChartDeleteYAxisElement(event: any) {
    event.stopPropagation();

    let eventDeleteYAxisElement: EventChartDeleteYAxisElement = {
      yAxisIndex: this.yAxisIndex
    };

    this.chartDeleteYAxisElement.emit(eventDeleteYAxisElement);
  }

  emitChartYAxisElementUpdate(item: { yAxisPart: MconfigChartYAxis }) {
    let { yAxisPart } = item;

    let event: EventChartYAxisElementUpdate = {
      yAxisIndex: this.yAxisIndex,
      yAxisPart: yAxisPart
    };

    this.chartYAxisElementUpdate.emit(event);
  }

  toggleScale() {
    let newYAxisPart: MconfigChartYAxis = {
      scale: !this.yAxisElement.scale
    };

    this.emitChartYAxisElementUpdate({ yAxisPart: newYAxisPart });
  }
}
