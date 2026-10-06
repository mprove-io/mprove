import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, type FormControl, type FormGroup } from '@angular/forms';

import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ChartType } from '#common/types/blockml/parts/chart/chart-type';
import type { MconfigChartSeries } from '#common/types/blockml/parts/mconfig/mconfig-chart-series';
import type { ChartSeriesWithField } from '#common/types/front/chart/chart-series-with-field';
import type { EventChartSeriesElementUpdate } from '#common/types/front/chart/events/event-chart-series-element-update';
import type { EventChartToggleSeries } from '#common/types/front/chart/events/event-chart-toggle-series';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { ChartTypeItem } from '../../models/models.component';

@Component({
  standalone: false,
  selector: 'm-chart-editor-series-element',
  templateUrl: './chart-editor-series-element.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartEditorSeriesElementComponent implements OnChanges {
  readonly stackableChartTypes: ChartType[] = ['line', 'bar'];
  readonly cartesianChartTypes: ChartType[] = ['line', 'bar', 'scatter'];

  @Input()
  seriesElement: ChartSeriesWithField;

  @Input()
  isReport: boolean;

  @Input()
  isExpanded: boolean;

  @Input()
  yAxisIndexList: number[];

  @Output() chartSeriesElementUpdate =
    new EventEmitter<EventChartSeriesElementUpdate>();

  @Output() chartToggleSeries = new EventEmitter<EventChartToggleSeries>();

  seriesTypesList: ChartTypeItem[] = [
    {
      label: 'Line',
      value: 'line',
      iconPath: 'assets/charts/line.svg'
    },
    {
      label: 'Bar',
      value: 'bar',
      iconPath: 'assets/charts/bar_vertical.svg'
    }
  ];

  seriesTypeForm: FormGroup<{
    seriesType: FormControl<ChartType>;
  }> = this.fb.group({
    seriesType: this.fb.control<ChartType>(undefined)
  });

  yAxisIndexForm: FormGroup<{
    yAxisIndex: FormControl<number>;
  }> = this.fb.group({
    yAxisIndex: this.fb.control<number>(undefined)
  });

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    setValueAndMark({
      control: this.seriesTypeForm.controls['seriesType'],
      value: this.seriesElement.type
    });

    setValueAndMark({
      control: this.yAxisIndexForm.controls['yAxisIndex'],
      value: this.seriesElement.yAxisIndex
    });
  }

  seriesTypeChange(newSeriesTypeValue?: ChartType) {
    (document.activeElement as HTMLElement).blur();

    if (isDefined(newSeriesTypeValue)) {
      this.seriesTypeForm.controls['seriesType'].setValue(newSeriesTypeValue);
    }

    let seriesType: ChartType =
      this.seriesTypeForm.controls['seriesType'].value;

    let newSeriesPart: MconfigChartSeries = {
      type: seriesType
    };

    this.emitChartSeriesElementUpdate({
      seriesDataRowId: this.seriesElement.dataRowId,
      seriesDataField: this.seriesElement.dataField,
      seriesPart: newSeriesPart
    });
  }

  yAxisIndexChange() {
    (document.activeElement as HTMLElement).blur();

    let yAxisIndex: number = this.yAxisIndexForm.controls['yAxisIndex'].value;

    let newSeriesPart: MconfigChartSeries = {
      yAxisIndex: yAxisIndex
    };

    this.emitChartSeriesElementUpdate({
      seriesDataRowId: this.seriesElement.dataRowId,
      seriesDataField: this.seriesElement.dataField,
      seriesPart: newSeriesPart
    });
  }

  emitChartToggleSeries(item: { dataRowId?: string; dataField?: string }) {
    let { dataRowId, dataField } = item;

    let event: EventChartToggleSeries = {
      seriesDataRowId: dataRowId,
      seriesDataField: dataField
    };

    this.chartToggleSeries.emit(event);
  }

  emitChartSeriesElementUpdate(item: {
    seriesDataRowId: string;
    seriesDataField: string;
    seriesPart: MconfigChartSeries;
  }) {
    let { seriesDataRowId, seriesDataField, seriesPart } = item;

    let event: EventChartSeriesElementUpdate = {
      seriesDataRowId: seriesDataRowId,
      seriesDataField: seriesDataField,
      seriesPart: seriesPart
    };

    this.chartSeriesElementUpdate.emit(event);
  }
}
