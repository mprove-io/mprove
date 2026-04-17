import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UI_CHART_TYPES } from '#common/constants/ui-chart-types';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import type { MconfigChartYAxis } from '#common/zod/blockml/mconfig-chart-y-axis';
import type { EventChartDeleteYAxisElement } from '#common/zod/front/event-chart-delete-y-axis-element';
import type { EventChartToggleYAxisElement } from '#common/zod/front/event-chart-toggle-y-axis-element';
import type { EventChartYAxisElementUpdate } from '#common/zod/front/event-chart-y-axis-element-update';

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
  chartType: ChartTypeEnum;

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
