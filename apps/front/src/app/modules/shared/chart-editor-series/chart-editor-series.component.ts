import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { ChartSeriesWithField } from '../chart-editor/chart-editor.component';

@Component({
  selector: 'm-chart-editor-series',
  templateUrl: './chart-editor-series.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartEditorSeriesElementComponent implements OnChanges {
  @Input()
  seriesElement: ChartSeriesWithField;

  @Input()
  isReport: boolean;

  @Input()
  isExpanded: boolean;

  @Output() chartSeriesElementUpdate =
    new EventEmitter<interfaces.EventChartSeriesElementUpdate>();

  @Output() chartToggleSeries =
    new EventEmitter<interfaces.EventChartToggleSeries>();

  // seriesTypesList: ChartTypeItem[] = [
  //   {
  //     label: 'Line',
  //     value: common.ChartTypeEnum.Line,
  //     iconPath: 'assets/charts/line.svg'
  //   },
  //   {
  //     label: 'Bar',
  //     value: common.ChartTypeEnum.Bar,
  //     iconPath: 'assets/charts/bar_vertical.svg'
  //   }
  // ];

  seriesTypeEnum = common.ChartTypeEnum;

  seriesTypeForm: FormGroup = this.fb.group({
    seriesType: [undefined]
  });

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    setValueAndMark({
      control: this.seriesTypeForm.controls['seriesType'],
      value: this.seriesElement.type
    });
  }

  seriesTypeChange(newSeriesTypeValue?: common.ChartTypeEnum) {
    (document.activeElement as HTMLElement).blur();

    if (common.isDefined(newSeriesTypeValue)) {
      this.seriesTypeForm.controls['seriesType'].setValue(newSeriesTypeValue);
    }

    let seriesType = this.seriesTypeForm.controls['seriesType'].value;

    let newSeries: ChartSeriesWithField = Object.assign(
      {},
      this.seriesElement,
      { type: seriesType }
    );

    this.emitChartSeriesElementUpdate({ series: newSeries });
  }

  emitChartSeriesElementUpdate(item: { series: ChartSeriesWithField }) {
    let { series } = item;

    let event: interfaces.EventChartSeriesElementUpdate = {
      series: series
    };

    this.chartSeriesElementUpdate.emit(event);
  }

  emitChartToggleSeries(seriesDataRowId: string) {
    let event: interfaces.EventChartToggleSeries = {
      seriesDataRowId: seriesDataRowId
    };

    this.chartToggleSeries.emit(event);
  }
}
