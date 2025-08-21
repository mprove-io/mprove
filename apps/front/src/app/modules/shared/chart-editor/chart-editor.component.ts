import {
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { setChartSeries } from '~common/_index';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { SeriesPart } from '~front/app/interfaces/series-part';
import { ChartQuery } from '~front/app/queries/chart.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { ChartService } from '~front/app/services/chart.service';
import { DataService } from '~front/app/services/data.service';
import { FormatNumberService } from '~front/app/services/format-number.service';
import { ReportService } from '~front/app/services/report.service';
import { StructService } from '~front/app/services/struct.service';
import { ValidationService } from '~front/app/services/validation.service';

export class ChartSeriesWithField extends MconfigChartSeries {
  field: MconfigField;
  isMetric: boolean;
  showMetricsModelName: boolean;
  showMetricsTimeFieldName: boolean;
  seriesName: string;
  seriesRowName: string;
  partNodeLabel: string;
  partFieldLabel: string;
  timeNodeLabel: string;
  timeFieldLabel: string;
  topLabel: string;
}

@Component({
  standalone: false,
  selector: 'm-chart-editor',
  templateUrl: './chart-editor.component.html'
})
export class ChartEditorComponent implements OnChanges {
  @ViewChild('xFieldSelect', { static: false })
  xFieldSelectElement: NgSelectComponent;

  @ViewChild('yFieldSelect', { static: false })
  yFieldSelectElement: NgSelectComponent;

  @ViewChild('multiFieldSelect', { static: false })
  multiFieldSelectElement: NgSelectComponent;

  @ViewChild('sizeFieldSelect', { static: false })
  sizeFieldSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.xFieldSelectElement?.close();
    this.multiFieldSelectElement?.close();
    this.yFieldSelectElement?.close();
    this.sizeFieldSelectElement?.close();
  }

  chartTypeEnum = ChartTypeEnum;
  chartTypeEnumTable = ChartTypeEnum.Table;
  chartTypeEnumSingle = ChartTypeEnum.Single;

  fieldResultEnum = FieldResultEnum;

  empty = EMPTY_MCONFIG_FIELD.topLabel;

  uiChartTypes = UI_CHART_TYPES;

  formatNumberExamples: any[] = FORMAT_NUMBER_EXAMPLES.map(x => {
    let struct = this.structQuery.getValue();

    x.output = this.dataService.formatValue({
      value: x.input,
      formatNumber: x.id,
      fieldResult: FieldResultEnum.Number,
      currencyPrefix: struct.currencyPrefix,
      currencySuffix: struct.currencySuffix,
      thousandsSeparator: struct.thousandsSeparator
    });

    return x;
  });

  @Input()
  chart: MconfigChart;

  @Input()
  queryId?: string;

  @Input()
  mconfigFields?: MconfigField[];

  @Input()
  seriesParts?: SeriesPart[];

  @Input()
  isReport: boolean;

  @Input()
  report: ReportX;

  dimensionsMeasuresCalculations: MconfigField[];

  numbersDimensionsMeasuresCalculationsPlusEmpty: MconfigField[];
  numbersDimensionsMeasuresCalculations: MconfigField[];

  dimensions: MconfigField[];
  dimensionsPlusEmpty: MconfigField[];

  numbersMeasuresAndCalculations: MconfigField[];
  numbersMeasuresAndCalculationsPlusEmpty: MconfigField[];

  numbersYFields: MconfigField[];

  chartSeriesWithField: ChartSeriesWithField[];

  xFieldResult: FieldResultEnum;

  xFieldForm: FormGroup = this.fb.group({
    xField: [undefined]
  });

  yFieldForm: FormGroup = this.fb.group({
    yField: [undefined]
  });

  sizeFieldForm: FormGroup = this.fb.group({
    sizeField: [undefined]
  });

  multiFieldForm: FormGroup = this.fb.group({
    multiField: [undefined]
  });

  pageSizeForm: FormGroup = this.fb.group({
    pageSize: [
      undefined,
      [
        Validators.required,
        ValidationService.integerOrEmptyValidator,
        Validators.min(1),
        Validators.maxLength(255)
      ]
    ]
  });

  chartOptionsIsExpanded = false;
  xAxisIsExpanded: boolean; // initial set in ngOnChanges
  yAxisIsExpanded = true;
  seriesToggleExpandList: string[] = [];
  yAxisToggleExpandList: number[] = [];

  yAxisIndexList: number[] = [];

  constructor(
    private fb: FormBuilder,
    private structService: StructService,
    private structQuery: StructQuery,
    private chartQuery: ChartQuery,
    private chartService: ChartService,
    private dataService: DataService,
    private reportService: ReportService,
    private formatNumberService: FormatNumberService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('changes');
    // console.log(changes);

    // console.log('this.chart');
    // console.log(this.chart);

    if (isUndefined(this.xAxisIsExpanded) && isDefined(this.isReport)) {
      this.xAxisIsExpanded = this.isReport === false;
    }

    this.yAxisIndexList = this.chart.yAxis.map((x, i) => i);

    if (this.isReport === false) {
      this.xFieldResult = this.mconfigFields.find(
        x => x.id === this.chart.xField
      )?.result;

      this.dimensionsMeasuresCalculations = this.mconfigFields.filter(
        x =>
          [
            FieldClassEnum.Dimension,
            FieldClassEnum.Measure,
            FieldClassEnum.Calculation
          ].indexOf(x.fieldClass) > -1
      );

      this.numbersDimensionsMeasuresCalculations = this.mconfigFields.filter(
        x =>
          x.result === FieldResultEnum.Number &&
          [
            FieldClassEnum.Dimension,
            FieldClassEnum.Measure,
            FieldClassEnum.Calculation
          ].indexOf(x.fieldClass) > -1
      );

      this.numbersDimensionsMeasuresCalculationsPlusEmpty = [
        makeCopy(EMPTY_MCONFIG_FIELD),
        ...this.numbersDimensionsMeasuresCalculations
      ];

      this.dimensions = this.mconfigFields.filter(
        x => x.fieldClass === FieldClassEnum.Dimension
      );

      this.dimensionsPlusEmpty = [
        makeCopy(EMPTY_MCONFIG_FIELD),
        ...this.dimensions
      ];

      this.numbersMeasuresAndCalculations = this.mconfigFields.filter(
        x =>
          x.result === FieldResultEnum.Number &&
          (x.fieldClass === FieldClassEnum.Measure ||
            x.fieldClass === FieldClassEnum.Calculation)
      );

      this.numbersMeasuresAndCalculationsPlusEmpty = [
        makeCopy(EMPTY_MCONFIG_FIELD),
        ...this.numbersMeasuresAndCalculations
      ];

      this.numbersYFields =
        this.chart.type === ChartTypeEnum.Scatter
          ? this.numbersDimensionsMeasuresCalculations
          : this.numbersMeasuresAndCalculations;

      setValueAndMark({
        control: this.xFieldForm.controls['xField'],
        value: this.chart.xField
      });

      setValueAndMark({
        control: this.yFieldForm.controls['yField'],
        value: this.chart.yFields.length > 0 ? this.chart.yFields[0] : undefined
      });

      setValueAndMark({
        control: this.sizeFieldForm.controls['sizeField'],
        value: this.chart.sizeField
      });

      setValueAndMark({
        control: this.multiFieldForm.controls['multiField'],
        value: this.chart.multiField
      });

      setValueAndMark({
        control: this.pageSizeForm.controls['pageSize'],
        value: this.chart.pageSize
      });

      let seriesCopy = makeCopy(this.chart.series);

      this.chartSeriesWithField = seriesCopy
        .map(x => {
          let yField = this.numbersYFields.find(y => y.id === x.dataField);
          (x as ChartSeriesWithField).field = yField;
          return x as ChartSeriesWithField;
        })
        .sort((a, b) => {
          let sortedIds = this.numbersYFields.map(x => x.id);
          let aIndex = sortedIds.indexOf(a.dataField);
          let bIndex = sortedIds.indexOf(b.dataField);

          return aIndex > bIndex ? 1 : bIndex > aIndex ? -1 : 0;
        });
    } else {
      // console.log('this.chart.series');
      // console.log(this.chart.series);

      let seriesCopy = makeCopy(this.chart.series);

      this.chartSeriesWithField = seriesCopy
        .map(x => {
          let seriesPart = this.seriesParts.find(
            sp => sp.seriesRowId === x.dataRowId
          );
          if (isDefined(seriesPart)) {
            (x as ChartSeriesWithField).seriesName = seriesPart.seriesName;
            (x as ChartSeriesWithField).seriesRowName =
              seriesPart.seriesRowName;
            (x as ChartSeriesWithField).isMetric = seriesPart.isMetric;
            (x as ChartSeriesWithField).showMetricsModelName =
              seriesPart.showMetricsModelName;
            (x as ChartSeriesWithField).showMetricsTimeFieldName =
              seriesPart.showMetricsTimeFieldName;
            (x as ChartSeriesWithField).partNodeLabel =
              seriesPart.partNodeLabel;
            (x as ChartSeriesWithField).partFieldLabel =
              seriesPart.partFieldLabel;
            (x as ChartSeriesWithField).timeNodeLabel =
              seriesPart.timeNodeLabel;
            (x as ChartSeriesWithField).timeFieldLabel =
              seriesPart.timeFieldLabel;
            (x as ChartSeriesWithField).topLabel = seriesPart.topLabel;
          }
          return x as ChartSeriesWithField;
        })
        .sort((a, b) =>
          a.dataRowId > b.dataRowId ? 1 : b.dataRowId > a.dataRowId ? -1 : 0
        );

      // this.chartSeriesWithField = makeCopy(
      //   this.chart.series as ChartSeriesWithField[]
      // );
    }

    // this.chartSeriesWithField
  }

  getIsValid() {
    let isChartValid = false;

    if (this.chart.type === ChartTypeEnum.Table) {
      isChartValid = this.pageSizeForm.controls['pageSize'].valid;
    }
    // else if (this.chart.type === ChartTypeEnum.BarVertical) {
    //   isChartValid =
    //     (this.chart.legend === false ||
    //       this.legendTitleForm.controls['legendTitle'].valid) &&
    //     (this.chart.xAxis === false ||
    //       this.chart.showXAxisLabel === false ||
    //       this.xAxisLabelForm.controls['xAxisLabel'].valid) &&
    //     (this.chart.yAxis === false ||
    //       this.chart.showYAxisLabel === false ||
    //       this.yAxisLabelForm.controls['yAxisLabel'].valid) &&
    //     this.yScaleMaxForm.controls['yScaleMax'].valid &&
    //     this.barPaddingForm.controls['barPadding'].valid &&
    //     this.formatNumberDataLabelForm.controls['formatNumberDataLabel']
    //       .valid &&
    //     this.formatNumberYAxisTickForm.controls['formatNumberYAxisTick'].valid;
    // }
    else {
      isChartValid = true;
    }

    return isChartValid;
  }

  chartEditorUpdateChart(item: {
    chartPart: MconfigChart;
    isCheck: boolean;
  }) {
    let { chartPart, isCheck } = item;

    if (this.isReport === false) {
      let newMconfig = this.structService.makeMconfig();

      newMconfig.chart = Object.assign({}, newMconfig.chart, chartPart);

      newMconfig = setChartSeries({ mconfig: newMconfig });

      let isCheckPass = false;

      if (isCheck === true) {
        let isValid = this.getIsValid();

        if (isValid === true) {
          newMconfig.chart.isValid = true;
          isCheckPass = true;
        }
      }

      if (isCheck === false || isCheckPass === true) {
        // query not changed
        if (newMconfig.modelType === ModelTypeEnum.Malloy) {
          this.chartService.editChart({
            mconfig: newMconfig,
            isDraft: this.chartQuery.getValue().draft,
            chartId: this.chartQuery.getValue().chartId,
            queryOperation: {
              type: QueryOperationTypeEnum.Get,
              timezone: newMconfig.timezone
            }
          });
        } else {
          this.chartService.editChart({
            mconfig: newMconfig,
            isDraft: this.chartQuery.getValue().draft,
            chartId: this.chartQuery.getValue().chartId
          });
        }
      }
    } else {
      let newChart = Object.assign({}, this.report.chart, chartPart);

      if (isCheck === true) {
        let isValid = this.getIsValid();
        if (isValid === true) {
          newChart.isValid = true;

          this.reportService.modifyRows({
            report: this.report,
            changeType: ChangeTypeEnum.EditChart,
            rowChange: undefined,
            rowIds: undefined,
            reportFields: this.report.fields,
            chart: newChart
          });
        }
      } else {
        this.reportService.modifyRows({
          report: this.report,
          changeType: ChangeTypeEnum.EditChart,
          rowChange: undefined,
          rowIds: undefined,
          reportFields: this.report.fields,
          chart: newChart
        });
      }
    }
  }

  pageSizeBlur() {
    let value = this.pageSizeForm.controls['pageSize'].value;

    let pageSize = isUndefinedOrEmpty(value) ? undefined : Number(value);

    if (isUndefined(pageSize) && isUndefined(this.chart.pageSize)) {
      return;
    }

    if (pageSize === this.chart.pageSize) {
      return;
    }

    let newChart: MconfigChart = <MconfigChart>{
      pageSize: pageSize
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: true });
  }

  hideColumnsIsChecked(id: string) {
    return this.chart.hideColumns.findIndex(x => x === id) > -1;
  }

  hideColumnsOnClick(id: string) {
    let index = this.chart.hideColumns.findIndex(x => x === id);

    let newChart: MconfigChart = <MconfigChart>{
      hideColumns:
        index > -1
          ? [
              ...this.chart.hideColumns.slice(0, index),
              ...this.chart.hideColumns.slice(index + 1)
            ]
          : [...this.chart.hideColumns, id]
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: true });
  }

  xFieldChange() {
    let xField = this.xFieldForm.controls['xField'].value;

    let newChart: MconfigChart = <MconfigChart>{
      xField: xField
    };

    if (
      UI_CHART_TYPES.multiField.indexOf(this.chart.type) > -1 &&
      UI_CHART_TYPES.nullableMultiField.indexOf(this.chart.type) < 0
    ) {
      let newMultiFieldValue = this.dimensions.filter(x => x.id !== xField)[0]
        .id;

      setValueAndMark({
        control: this.multiFieldForm.controls['multiField'],
        value: newMultiFieldValue
      });

      newChart.multiField = newMultiFieldValue;
    }

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  yFieldsIsChecked(id: string) {
    return this.chart.yFields.findIndex(x => x === id) > -1;
  }

  yFieldsOnClick(id: string) {
    let index = this.chart.yFields.findIndex(x => x === id);

    let newChart: MconfigChart = <MconfigChart>{
      yFields:
        index > -1
          ? [
              ...this.chart.yFields.slice(0, index),
              ...this.chart.yFields.slice(index + 1)
            ]
          : [...this.chart.yFields, id]
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: true });
  }

  yFieldChange() {
    let yField = this.yFieldForm.controls['yField'].value;

    let newChart: MconfigChart = <MconfigChart>{
      yFields: [yField]
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  sizeFieldChange() {
    let sizeField = this.sizeFieldForm.controls['sizeField'].value;

    let newChart: MconfigChart = <MconfigChart>{
      sizeField: sizeField
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  multiFieldChange() {
    let multiField = this.multiFieldForm.controls['multiField'].value;

    let newChart: MconfigChart = <MconfigChart>{
      multiField: multiField
    };

    if (UI_CHART_TYPES.nullableMultiField.indexOf(this.chart.type) < 0) {
      let newXFieldValue = this.dimensions.filter(x => x.id !== multiField)[0]
        .id;

      setValueAndMark({
        control: this.xFieldForm.controls['xField'],
        value: newXFieldValue
      });

      newChart.xField = newXFieldValue;
    }

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  toggleFormat() {
    let newChart: MconfigChart = <MconfigChart>{
      format: !this.chart.format
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  chartToggleSeries(eventToggleSeries: EventChartToggleSeries) {
    let { seriesDataField, seriesDataRowId } = eventToggleSeries;

    let id = isDefined(seriesDataField) ? seriesDataField : seriesDataRowId;

    if (this.seriesToggleExpandList.indexOf(id) > -1) {
      this.seriesToggleExpandList = this.seriesToggleExpandList.filter(
        x => x !== id
      );
    } else {
      this.seriesToggleExpandList = [...this.seriesToggleExpandList, id];
    }
  }

  chartSeriesElementUpdate(eventSeriesUpdate: EventChartSeriesElementUpdate) {
    let newChart: MconfigChart = <MconfigChart>{
      series: this.chart.series.map(s => {
        let newSeriesElement =
          (this.isReport === true &&
            eventSeriesUpdate.seriesDataRowId === s.dataRowId) ||
          (this.isReport === false &&
            eventSeriesUpdate.seriesDataField === s.dataField)
            ? Object.assign({}, s, eventSeriesUpdate.seriesPart)
            : s;

        return newSeriesElement;
      })
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  toggleChartOptions() {
    this.chartOptionsIsExpanded = !this.chartOptionsIsExpanded;
  }

  toggleXAxis() {
    this.xAxisIsExpanded = !this.xAxisIsExpanded;
  }

  toggleXAxisScale() {
    let newChart: MconfigChart = <MconfigChart>{
      xAxis: {
        scale: !this.chart.xAxis.scale
      }
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  toggleYAxis() {
    this.yAxisIsExpanded = !this.yAxisIsExpanded;
  }

  addYAxis() {
    this.yAxisIsExpanded = true;

    let newYAxis = makeCopy(DEFAULT_CHART_Y_AXIS);

    // let newYAxis = Object.assign({}, DEFAULT_CHART_Y_AXIS, {
    //   axisLine: { onZero: false },
    //   offset: 50
    // });

    let newChart: MconfigChart = <MconfigChart>{
      yAxis: [...this.chart.yAxis, newYAxis]
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  chartToggleYAxisElement(event: EventChartToggleYAxisElement) {
    let { yAxisIndex } = event;

    if (this.yAxisToggleExpandList.indexOf(yAxisIndex) > -1) {
      this.yAxisToggleExpandList = this.yAxisToggleExpandList.filter(
        x => x !== yAxisIndex
      );
    } else {
      this.yAxisToggleExpandList = [...this.yAxisToggleExpandList, yAxisIndex];
    }
  }

  chartDeleteYAxisElement(event: EventChartDeleteYAxisElement) {
    let { yAxisIndex } = event;

    let newChart: MconfigChart = <MconfigChart>{
      yAxis: this.chart.yAxis.filter((x, i) => i !== yAxisIndex)
    };

    this.yAxisToggleExpandList = [];

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }

  chartYAxisElementUpdate(event: EventChartYAxisElementUpdate) {
    let newChart: MconfigChart = <MconfigChart>{
      yAxis: this.chart.yAxis.map((y, i) => {
        let newYAxisElement =
          event.yAxisIndex === i ? Object.assign({}, y, event.yAxisPart) : y;

        return newYAxisElement;
      })
    };

    this.chartEditorUpdateChart({ chartPart: newChart, isCheck: false });
  }
}

//
//
//

// unitsForm: FormGroup = this.fb.group({
//   units: [undefined, [Validators.required, Validators.maxLength(255)]]
// });

// formatNumberDataLabelForm: FormGroup = this.fb.group({
//   formatNumberDataLabel: [
//     undefined,
//     [ValidationService.formatNumberValidator, Validators.maxLength(255)]
//   ]
// });

// formatNumberValueForm: FormGroup = this.fb.group({
//   formatNumberValue: [
//     undefined,
//     [ValidationService.formatNumberValidator, Validators.maxLength(255)]
//   ]
// });

// formatNumberAxisTickForm: FormGroup = this.fb.group({
//   formatNumberAxisTick: [
//     undefined,
//     [ValidationService.formatNumberValidator, Validators.maxLength(255)]
//   ]
// });

// formatNumberYAxisTickForm: FormGroup = this.fb.group({
//   formatNumberYAxisTick: [
//     undefined,
//     [ValidationService.formatNumberValidator, Validators.maxLength(255)]
//   ]
// });

// formatNumberXAxisTickForm: FormGroup = this.fb.group({
//   formatNumberXAxisTick: [
//     undefined,
//     [ValidationService.formatNumberValidator, Validators.maxLength(255)]
//   ]
// });

// angleSpanForm: FormGroup = this.fb.group({
//   angleSpan: [
//     undefined,
//     [
//       Validators.required,
//       ValidationService.integerOrEmptyValidator,
//       Validators.min(0)
//     ]
//   ]
// });

// startAngleForm: FormGroup = this.fb.group({
//   startAngle: [
//     undefined,
//     [Validators.required, ValidationService.integerOrEmptyValidator]
//   ]
// });

// arcWidthForm: FormGroup = this.fb.group({
//   arcWidth: [
//     undefined,
//     [
//       Validators.required,
//       ValidationService.numberOrEmptyValidator,
//       Validators.min(0)
//     ]
//   ]
// });

// minForm: FormGroup = this.fb.group({
//   min: [
//     undefined,
//     [Validators.required, ValidationService.integerOrEmptyValidator]
//   ]
// });

// maxForm: FormGroup = this.fb.group({
//   max: [undefined, [ValidationService.integerOrEmptyValidator]]
// });

// xScaleMaxForm: FormGroup = this.fb.group({
//   xScaleMax: [undefined, [ValidationService.numberOrEmptyValidator]]
// });

// yScaleMinForm: FormGroup = this.fb.group({
//   yScaleMin: [
//     undefined,
//     [
//       ValidationService.numberOrEmptyValidator,
//       ValidationService.notZeroOrEmptyValidator
//     ]
//   ]
// });

// yScaleMaxForm: FormGroup = this.fb.group({
//   yScaleMax: [undefined, [ValidationService.numberOrEmptyValidator]]
// });

// barPaddingForm: FormGroup = this.fb.group({
//   barPadding: [
//     undefined,
//     [
//       Validators.required,
//       ValidationService.integerOrEmptyValidator,
//       Validators.min(0)
//     ]
//   ]
// });

// bigSegmentsForm: FormGroup = this.fb.group({
//   bigSegments: [
//     undefined,
//     [
//       Validators.required,
//       ValidationService.integerOrEmptyValidator,
//       Validators.min(1)
//     ]
//   ]
// });

// smallSegmentsForm: FormGroup = this.fb.group({
//   smallSegments: [
//     undefined,
//     [
//       Validators.required,
//       ValidationService.integerOrEmptyValidator,
//       Validators.min(0)
//     ]
//   ]
// });

// groupPaddingForm: FormGroup = this.fb.group({
//   groupPadding: [
//     undefined,
//     [
//       Validators.required,
//       ValidationService.integerOrEmptyValidator,
//       Validators.min(0)
//     ]
//   ]
// });

// innerPaddingForm: FormGroup = this.fb.group({
//   innerPadding: [
//     undefined,
//     [
//       Validators.required,
//       ValidationService.integerOrEmptyValidator,
//       Validators.min(0)
//     ]
//   ]
// });

// legendTitleForm: FormGroup = this.fb.group({
//   legendTitle: [undefined, [Validators.maxLength(255)]]
// });

// xAxisLabelForm: FormGroup = this.fb.group({
//   xAxisLabel: [undefined, [Validators.required, Validators.maxLength(255)]]
// });

// yAxisLabelForm: FormGroup = this.fb.group({
//   yAxisLabel: [undefined, [Validators.required, Validators.maxLength(255)]]
// });

// schemeTypesList: SchemeTypeItem[] = [
//   {
//     label: 'Ordinal',
//     value: ChartSchemeTypeEnum.Ordinal
//   },
//   {
//     label: 'Linear',
//     value: ChartSchemeTypeEnum.Linear
//   }
// ];

//
//
//

// setValueAndMark({
//   control: this.colorSchemeForm.controls['colorScheme'],
//   value: this.chart.colorScheme
// });

// setValueAndMark({
//   control: this.schemeTypeForm.controls['schemeType'],
//   value: this.chart.schemeType
// });

// setValueAndMark({
//   control: this.interpolationForm.controls['interpolation'],
//   value: this.chart.interpolation
// });

// setValueAndMark({
//   control: this.unitsForm.controls['units'],
//   value: this.chart.units
// });

// setValueAndMark({
//   control: this.formatNumberDataLabelForm.controls['formatNumberDataLabel'],
//   value: this.formatNumberService.getFormatNumberDataLabel({
//     chart: this.chart,
//     mconfigFields: this.mconfigFields
//   }).formatNumber
// });

// setValueAndMark({
//   control: this.formatNumberValueForm.controls['formatNumberValue'],
//   value: this.formatNumberService.getFormatNumberValue({
//     chart: this.chart,
//     mconfigFields: this.mconfigFields
//   }).formatNumber
// });

// setValueAndMark({
//   control: this.formatNumberAxisTickForm.controls['formatNumberAxisTick'],
//   value: this.formatNumberService.getFormatNumberAxisTick({
//     chart: this.chart,
//     mconfigFields: this.mconfigFields
//   }).formatNumber
// });

// setValueAndMark({
//   control: this.formatNumberYAxisTickForm.controls['formatNumberYAxisTick'],
//   value: this.formatNumberService.getFormatNumberYAxisTick({
//     chart: this.chart,
//     mconfigFields: this.mconfigFields
//   }).formatNumber
// });

// setValueAndMark({
//   control: this.formatNumberXAxisTickForm.controls['formatNumberXAxisTick'],
//   value: this.formatNumberService.getFormatNumberXAxisTick({
//     chart: this.chart,
//     mconfigFields: this.mconfigFields
//   }).formatNumber
// });

// setValueAndMark({
//   control: this.angleSpanForm.controls['angleSpan'],
//   value: this.chart.angleSpan
// });

// setValueAndMark({
//   control: this.startAngleForm.controls['startAngle'],
//   value: this.chart.startAngle
// });

// setValueAndMark({
//   control: this.arcWidthForm.controls['arcWidth'],
//   value: this.chart.arcWidth
// });

// setValueAndMark({
//   control: this.minForm.controls['min'],
//   value: this.chart.min
// });

// setValueAndMark({
//   control: this.maxForm.controls['max'],
//   value: this.chart.max
// });

// setValueAndMark({
//   control: this.xScaleMaxForm.controls['xScaleMax'],
//   value: this.chart.xScaleMax
// });

// setValueAndMark({
//   control: this.yScaleMinForm.controls['yScaleMin'],
//   value: this.chart.yScaleMin
// });

// setValueAndMark({
//   control: this.yScaleMaxForm.controls['yScaleMax'],
//   value: this.chart.yScaleMax
// });

// setValueAndMark({
//   control: this.barPaddingForm.controls['barPadding'],
//   value: this.chart.barPadding
// });

// setValueAndMark({
//   control: this.bigSegmentsForm.controls['bigSegments'],
//   value: this.chart.bigSegments
// });

// setValueAndMark({
//   control: this.smallSegmentsForm.controls['smallSegments'],
//   value: this.chart.smallSegments
// });

// setValueAndMark({
//   control: this.groupPaddingForm.controls['groupPadding'],
//   value: this.chart.groupPadding
// });

// setValueAndMark({
//   control: this.innerPaddingForm.controls['innerPadding'],
//   value: this.chart.innerPadding
// });

// setValueAndMark({
//   control: this.legendTitleForm.controls['legendTitle'],
//   value: this.chart.legendTitle
// });

// setValueAndMark({
//   control: this.xAxisLabelForm.controls['xAxisLabel'],
//   value: this.chart.xAxisLabel
// });

// setValueAndMark({
//   control: this.yAxisLabelForm.controls['yAxisLabel'],
//   value: this.chart.yAxisLabel
// });

//
//
//

// unitsBlur() {
//   let units = this.unitsForm.controls['units'].value;

//   if (units === this.chart.units) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.units = units;
//   this.updateMconfig(newMconfig);
// }

// formatNumberDataLabelBlur() {
//   let formatNumberDataLabel =
//     this.formatNumberDataLabelForm.controls['formatNumberDataLabel'].value;

//   if (formatNumberDataLabel === this.chart.formatNumberDataLabel) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.formatNumberDataLabel = formatNumberDataLabel;
//   this.updateMconfig(newMconfig);
// }

// formatNumberValueBlur() {
//   let formatNumberValue =
//     this.formatNumberValueForm.controls['formatNumberValue'].value;

//   if (formatNumberValue === this.chart.formatNumberValue) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.formatNumberValue = formatNumberValue;
//   this.updateMconfig(newMconfig);
// }

// formatNumberAxisTickBlur() {
//   let formatNumberAxisTick =
//     this.formatNumberAxisTickForm.controls['formatNumberAxisTick'].value;

//   if (formatNumberAxisTick === this.chart.formatNumberAxisTick) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.formatNumberAxisTick = formatNumberAxisTick;
//   this.updateMconfig(newMconfig);
// }

// formatNumberYAxisTickBlur() {
//   let formatNumberYAxisTick =
//     this.formatNumberYAxisTickForm.controls['formatNumberYAxisTick'].value;

//   if (formatNumberYAxisTick === this.chart.formatNumberYAxisTick) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.formatNumberYAxisTick = formatNumberYAxisTick;
//   this.updateMconfig(newMconfig);
// }

// formatNumberXAxisTickBlur() {
//   let formatNumberXAxisTick =
//     this.formatNumberXAxisTickForm.controls['formatNumberXAxisTick'].value;

//   if (formatNumberXAxisTick === this.chart.formatNumberXAxisTick) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.formatNumberXAxisTick = formatNumberXAxisTick;
//   this.updateMconfig(newMconfig);
// }

// angleSpanBlur() {
//   let value = this.angleSpanForm.controls['angleSpan'].value;

//   let angleSpan = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(angleSpan) &&
//     isUndefined(this.chart.angleSpan)
//   ) {
//     return;
//   }

//   if (angleSpan === this.chart.angleSpan) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.angleSpan = angleSpan;
//   this.updateMconfig(newMconfig);
// }

// startAngleBlur() {
//   let value = this.startAngleForm.controls['startAngle'].value;

//   let startAngle = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(startAngle) &&
//     isUndefined(this.chart.startAngle)
//   ) {
//     return;
//   }

//   if (startAngle === this.chart.startAngle) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.startAngle = startAngle;
//   this.updateMconfig(newMconfig);
// }

// arcWidthBlur() {
//   let value = this.arcWidthForm.controls['arcWidth'].value;

//   let arcWidth = isUndefinedOrEmpty(value) ? undefined : Number(value);

//   if (
//     isUndefined(arcWidth) &&
//     isUndefined(this.chart.arcWidth)
//   ) {
//     return;
//   }

//   if (arcWidth === this.chart.arcWidth) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.arcWidth = arcWidth;
//   this.updateMconfig(newMconfig);
// }

// minBlur() {
//   let value = this.minForm.controls['min'].value;

//   let min = isUndefinedOrEmpty(value) ? undefined : Number(value);

//   if (isUndefined(min) && isUndefined(this.chart.min)) {
//     return;
//   }

//   if (min === this.chart.min) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.min = min;
//   this.updateMconfig(newMconfig);
// }

// maxBlur() {
//   let value = this.maxForm.controls['max'].value;

//   let max = isUndefinedOrEmpty(value) ? undefined : Number(value);

//   if (isUndefined(max) && isUndefined(this.chart.max)) {
//     return;
//   }

//   if (max === this.chart.max) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.max = max;
//   this.updateMconfig(newMconfig);
// }

// xScaleMaxBlur() {
//   let value = this.xScaleMaxForm.controls['xScaleMax'].value;

//   let xScaleMax = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(xScaleMax) &&
//     isUndefined(this.chart.xScaleMax)
//   ) {
//     return;
//   }

//   if (xScaleMax === this.chart.xScaleMax) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.xScaleMax = xScaleMax;
//   this.updateMconfig(newMconfig);
// }

// yScaleMinBlur() {
//   let value = this.yScaleMinForm.controls['yScaleMin'].value;

//   let yScaleMin = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(yScaleMin) &&
//     isUndefined(this.chart.yScaleMin)
//   ) {
//     return;
//   }

//   if (yScaleMin === this.chart.yScaleMin) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.yScaleMin = yScaleMin;
//   this.updateMconfig(newMconfig);
// }

// yScaleMaxBlur() {
//   let value = this.yScaleMaxForm.controls['yScaleMax'].value;

//   let yScaleMax = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(yScaleMax) &&
//     isUndefined(this.chart.yScaleMax)
//   ) {
//     return;
//   }

//   if (yScaleMax === this.chart.yScaleMax) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.yScaleMax = yScaleMax;
//   this.updateMconfig(newMconfig);
// }

// barPaddingBlur() {
//   let value = this.barPaddingForm.controls['barPadding'].value;

//   let barPadding = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(barPadding) &&
//     isUndefined(this.chart.barPadding)
//   ) {
//     return;
//   }

//   if (barPadding === this.chart.barPadding) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.barPadding = barPadding;
//   this.updateMconfig(newMconfig);
// }

// bigSegmentsBlur() {
//   let value = this.bigSegmentsForm.controls['bigSegments'].value;

//   let bigSegments = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(bigSegments) &&
//     isUndefined(this.chart.bigSegments)
//   ) {
//     return;
//   }

//   if (bigSegments === this.chart.bigSegments) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.bigSegments = bigSegments;
//   this.updateMconfig(newMconfig);
// }

// smallSegmentsBlur() {
//   let value = this.smallSegmentsForm.controls['smallSegments'].value;

//   let smallSegments = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(smallSegments) &&
//     isUndefined(this.chart.smallSegments)
//   ) {
//     return;
//   }

//   if (smallSegments === this.chart.smallSegments) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.smallSegments = smallSegments;
//   this.updateMconfig(newMconfig);
// }

// groupPaddingBlur() {
//   let value = this.groupPaddingForm.controls['groupPadding'].value;

//   let groupPadding = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(groupPadding) &&
//     isUndefined(this.chart.groupPadding)
//   ) {
//     return;
//   }

//   if (groupPadding === this.chart.groupPadding) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.groupPadding = groupPadding;
//   this.updateMconfig(newMconfig);
// }

// innerPaddingBlur() {
//   let value = this.innerPaddingForm.controls['innerPadding'].value;

//   let innerPadding = isUndefinedOrEmpty(value)
//     ? undefined
//     : Number(value);

//   if (
//     isUndefined(innerPadding) &&
//     isUndefined(this.chart.innerPadding)
//   ) {
//     return;
//   }

//   if (innerPadding === this.chart.innerPadding) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.innerPadding = innerPadding;
//   this.updateMconfig(newMconfig);
// }

// legendTitleBlur() {
//   let legendTitle = this.legendTitleForm.controls['legendTitle'].value;
//   if (legendTitle === this.chart.legendTitle) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.legendTitle = legendTitle;
//   this.updateMconfig(newMconfig);
// }

// xAxisLabelBlur() {
//   let xAxisLabel = this.xAxisLabelForm.controls['xAxisLabel'].value;

//   if (xAxisLabel === this.chart.xAxisLabel) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.xAxisLabel = xAxisLabel;
//   this.updateMconfig(newMconfig);
// }

// yAxisLabelBlur() {
//   let yAxisLabel = this.yAxisLabelForm.controls['yAxisLabel'].value;

//   if (yAxisLabel === this.chart.yAxisLabel) {
//     return;
//   }

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.yAxisLabel = yAxisLabel;
//   this.updateMconfig(newMconfig);
// }

// colorSchemeChange() {
//   let colorScheme = this.colorSchemeForm.controls['colorScheme'].value;

//   let newSchemeTypeValue: ChartSchemeTypeEnum =
//     [
//       ChartColorSchemeEnum.Solar,
//       ChartColorSchemeEnum.Air,
//       ChartColorSchemeEnum.Aqua
//     ].indexOf(colorScheme) > -1
//       ? ChartSchemeTypeEnum.Linear
//       : ChartSchemeTypeEnum.Ordinal;

//   setValueAndMark({
//     control: this.schemeTypeForm.controls['schemeType'],
//     value: newSchemeTypeValue
//   });

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.colorScheme = colorScheme;
//   newMconfig.chart.schemeType = newSchemeTypeValue;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// schemeTypeChange() {
//   let schemeType = this.schemeTypeForm.controls['schemeType'].value;
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.schemeType = schemeType;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// interpolationChange() {
//   let interpolation = this.interpolationForm.controls['interpolation'].value;
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.interpolation = interpolation;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// bandColorChange($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.bandColor = $event.color;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// cardColorChange($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.cardColor = $event.color;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// textColorChange($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.textColor = $event.color;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// emptyColorChange($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.emptyColor = $event.color;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleXAxis($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.xAxis = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleYAxis($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.yAxis = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleShowXAxisLabel($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.showXAxisLabel = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleShowYAxisLabel($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.showYAxisLabel = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleShowAxis($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.showAxis = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleAnimations($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.animations = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleGradient($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.gradient = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleLegend($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.legend = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleTooltipDisabled($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.tooltipDisabled = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleRoundEdges($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.roundEdges = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleRoundDomains($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.roundDomains = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleShowGridLines($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.showGridLines = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleTimeline($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.timeline = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleAutoScale($event: any) {
//   setValueAndMark({
//     control: this.yScaleMinForm.controls['yScaleMin'],
//     value: null
//   });

//   setValueAndMark({
//     control: this.yScaleMaxForm.controls['yScaleMax'],
//     value: null
//   });

//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.autoScale = $event;
//   newMconfig.chart.yScaleMin = null;
//   newMconfig.chart.yScaleMax = null;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleDoughnut($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.doughnut = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleExplodeSlices($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.explodeSlices = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleLabels($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.labels = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }

// toggleShowDataLabel($event: any) {
//   let newMconfig = this.structService.makeMconfig();
//   newMconfig.chart.showDataLabel = $event;
//   this.updateMconfig({ newMconfig: newMconfig, isCheck: false });
// }
