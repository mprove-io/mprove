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
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { MconfigChartSeries } from '~common/interfaces/blockml/mconfig-chart-series';
import { EventChartSeriesElementUpdate } from '~common/interfaces/front/event-chart-series-element-update';
import { EventChartToggleSeries } from '~common/interfaces/front/event-chart-toggle-series';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { ChartTypeItem } from '../../models/models.component';
import { ChartSeriesWithField } from '../chart-editor/chart-editor.component';

@Component({
  standalone: false,
  selector: 'm-chart-editor-series-element',
  templateUrl: './chart-editor-series-element.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartEditorSeriesElementComponent implements OnChanges {
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
      value: ChartTypeEnum.Line,
      iconPath: 'assets/charts/line.svg'
    },
    {
      label: 'Bar',
      value: ChartTypeEnum.Bar,
      iconPath: 'assets/charts/bar_vertical.svg'
    }
  ];

  seriesTypeEnum = ChartTypeEnum;

  seriesTypeForm: FormGroup = this.fb.group({
    seriesType: [undefined]
  });

  yAxisIndexForm: FormGroup = this.fb.group({
    yAxisIndex: [undefined]
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

  seriesTypeChange(newSeriesTypeValue?: ChartTypeEnum) {
    (document.activeElement as HTMLElement).blur();

    if (isDefined(newSeriesTypeValue)) {
      this.seriesTypeForm.controls['seriesType'].setValue(newSeriesTypeValue);
    }

    let seriesType = this.seriesTypeForm.controls['seriesType'].value;

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

    let yAxisIndex = this.yAxisIndexForm.controls['yAxisIndex'].value;

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
