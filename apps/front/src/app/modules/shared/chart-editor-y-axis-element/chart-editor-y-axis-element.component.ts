import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MconfigChartYAxis } from '~common/_index';

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
  chartType: ChartTypeEnum;

  @Output() chartToggleYAxisElement =
    new EventEmitter<EventChartToggleYAxisElement>();

  @Output() chartDeleteYAxisElement =
    new EventEmitter<EventChartDeleteYAxisElement>();

  @Output() chartYAxisElementUpdate =
    new EventEmitter<EventChartYAxisElementUpdate>();

  uiChartTypes = UI_CHART_TYPES;

  constructor(private fb: FormBuilder) {}

  // ngOnChanges(changes: SimpleChanges): void {
  // }

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
