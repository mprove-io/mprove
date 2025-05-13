import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { MconfigChartYAxis } from '~common/_index';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';

@Component({
  standalone: false,
  selector: 'm-chart-editor-y-axis-element',
  templateUrl: './chart-editor-y-axis-element.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
// implements OnChanges
export class ChartEditorYAxisElementComponent {
  @Input()
  yAxisIndex: number;

  @Input()
  yAxisElement: MconfigChartYAxis;

  @Input()
  isExpanded: boolean;

  @Input()
  chartType: common.ChartTypeEnum;

  @Output() chartToggleYAxisElement =
    new EventEmitter<interfaces.EventChartToggleYAxisElement>();

  @Output() chartDeleteYAxisElement =
    new EventEmitter<interfaces.EventChartDeleteYAxisElement>();

  @Output() chartYAxisElementUpdate =
    new EventEmitter<interfaces.EventChartYAxisElementUpdate>();

  uiChartTypes = common.UI_CHART_TYPES;

  constructor(private fb: FormBuilder) {}

  // ngOnChanges(changes: SimpleChanges): void {
  // }

  emitChartToggleYAxisElement() {
    let event: interfaces.EventChartToggleYAxisElement = {
      yAxisIndex: this.yAxisIndex
    };

    this.chartToggleYAxisElement.emit(event);
  }

  emitChartDeleteYAxisElement(event: any) {
    event.stopPropagation();

    let eventDeleteYAxisElement: interfaces.EventChartDeleteYAxisElement = {
      yAxisIndex: this.yAxisIndex
    };

    this.chartDeleteYAxisElement.emit(eventDeleteYAxisElement);
  }

  emitChartYAxisElementUpdate(item: { yAxisPart: common.MconfigChartYAxis }) {
    let { yAxisPart } = item;

    let event: interfaces.EventChartYAxisElementUpdate = {
      yAxisIndex: this.yAxisIndex,
      yAxisPart: yAxisPart
    };

    this.chartYAxisElementUpdate.emit(event);
  }

  toggleScale() {
    let newYAxisPart: common.MconfigChartYAxis = {
      scale: !this.yAxisElement.scale
    };

    this.emitChartYAxisElementUpdate({ yAxisPart: newYAxisPart });
  }
}
