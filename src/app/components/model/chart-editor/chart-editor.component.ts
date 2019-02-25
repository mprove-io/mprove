import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { ErrorStateMatcher, MatSelectChange } from '@angular/material';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as constants from '@app/constants/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';
import * as services from '@app/services/_index';
import * as uuid from 'uuid';
import { MColorChange } from '@app/modules/colorpicker/colorpicker';

@Component({
  moduleId: module.id,
  selector: 'm-chart-editor',
  templateUrl: 'chart-editor.component.html',
  styleUrls: ['chart-editor.component.scss']
})
export class ChartEditorComponent implements OnInit, OnChanges {
  // data
  xFieldChartTypes = constants.xFieldChartTypes;
  yFieldChartTypes = constants.yFieldChartTypes;
  yFieldsChartTypes = constants.yFieldsChartTypes;
  hideColumnsChartTypes = constants.hideColumnsChartTypes;
  multiFieldChartTypes = constants.multiFieldChartTypes;
  valueFieldChartTypes = constants.valueFieldChartTypes;
  previousValueFieldChartTypes = constants.previousValueFieldChartTypes;

  // axis
  xAxisChartTypes = constants.xAxisChartTypes;
  showXAxisLabelChartTypes = constants.showXAxisLabelChartTypes;
  xAxisLabelChartTypes = constants.xAxisLabelChartTypes;
  yAxisChartTypes = constants.yAxisChartTypes;
  showYAxisLabelChartTypes = constants.showYAxisLabelChartTypes;
  yAxisLabelChartTypes = constants.yAxisLabelChartTypes;
  showAxisChartTypes = constants.showAxisChartTypes;

  // options
  animationsChartTypes = constants.animationsChartTypes;
  gradientChartTypes = constants.gradientChartTypes;
  legendChartTypes = constants.legendChartTypes;
  legendTitleChartTypes = constants.legendTitleChartTypes;
  tooltipDisabledChartTypes = constants.tooltipDisabledChartTypes;
  roundEdgesChartTypes = constants.roundEdgesChartTypes;
  roundDomainsChartTypes = constants.roundDomainsChartTypes;
  showGridLinesChartTypes = constants.showGridLinesChartTypes;
  timelineChartTypes = constants.timelineChartTypes;
  autoScaleChartTypes = constants.autoScaleChartTypes;
  doughnutChartTypes = constants.doughnutChartTypes;
  explodeSlicesChartTypes = constants.explodeSlicesChartTypes;
  labelsChartTypes = constants.labelsChartTypes;
  interpolationChartTypes = constants.interpolationChartTypes;
  colorSchemeChartTypes = constants.colorSchemeChartTypes;
  schemeTypeChartTypes = constants.schemeTypeChartTypes;
  pageSizeChartTypes = constants.pageSizeChartTypes;
  arcWidthChartTypes = constants.arcWidthChartTypes;
  barPaddingChartTypes = constants.barPaddingChartTypes;
  groupPaddingChartTypes = constants.groupPaddingChartTypes;
  innerPaddingChartTypes = constants.innerPaddingChartTypes;
  angleSpanChartTypes = constants.angleSpanChartTypes;
  startAngleChartTypes = constants.startAngleChartTypes;
  yScaleMinChartTypes = constants.yScaleMinChartTypes;
  yScaleMaxChartTypes = constants.yScaleMaxChartTypes;
  xScaleMaxChartTypes = constants.xScaleMaxChartTypes;
  bigSegmentsChartTypes = constants.bigSegmentsChartTypes;
  smallSegmentsChartTypes = constants.smallSegmentsChartTypes;
  minChartTypes = constants.minChartTypes;
  maxChartTypes = constants.maxChartTypes;
  unitsChartTypes = constants.unitsChartTypes;
  bandColorChartTypes = constants.bandColorChartTypes;
  cardColorChartTypes = constants.cardColorChartTypes;
  textColorChartTypes = constants.textColorChartTypes;
  emptyColorChartTypes = constants.emptyColorChartTypes;

  chartIconEnum = enums.ChartIconEnum;
  chartTypeEnum = api.ChartTypeEnum;
  chartInterpolationEnum = api.ChartInterpolationEnum;
  chartColorSchemeEnum = api.ChartColorSchemeEnum;
  chartSchemeTypeEnum = api.ChartSchemeTypeEnum;
  chartTileWidthEnum = api.ChartTileWidthEnum;
  chartTileHeightEnum = api.ChartTileHeightEnum;
  chartViewSizeEnum = api.ChartViewSizeEnum;

  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

  rangeFillOpacityForm: FormGroup;
  rangeFillOpacity: AbstractControl;

  viewHeightForm: FormGroup;
  viewHeight: AbstractControl;

  showOnInvalidErrorStateMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) => {
      if (control) {
        return control.invalid;
      }

      return false;
    }
  };

  minValid: boolean;
  maxValid: boolean;
  unitsValid: boolean;
  titleValid: boolean;
  xAxisLabelValid: boolean;
  yAxisLabelValid: boolean;
  legendTitleValid: boolean;
  pageSizeValid: boolean;
  arcWidthValid: boolean;
  barPaddingValid: boolean;
  groupPaddingValid: boolean;
  innerPaddingValid: boolean;
  angleSpanValid: boolean;
  startAngleValid: boolean;
  yScaleMinValid: boolean;
  yScaleMaxValid: boolean;
  xScaleMaxValid: boolean;
  bigSegmentsValid: boolean;
  smallSegmentsValid: boolean;
  viewWidthValid: boolean;

  constructor(
    private store: Store<interfaces.AppState>,
    private structService: services.StructService,
    private myDialogService: services.MyDialogService,
    private fb: FormBuilder,
    private navigateMconfigService: services.NavigateService
  ) {}

  ngOnInit() {
    this.buildForms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildForms();
  }

  buildForms() {
    this.buildRangeFillOpacityForm();

    this.buildViewHeightForm();
  }

  buildRangeFillOpacityForm() {
    this.rangeFillOpacityForm = this.fb.group({
      rangeFillOpacity: [
        this.chart.range_fill_opacity,
        Validators.compose([
          Validators.required,
          services.ValidationService.numberValidator,
          Validators.min(0)
        ])
      ]
    });

    this.rangeFillOpacity = this.rangeFillOpacityForm.controls[
      'rangeFillOpacity'
    ];
  }

  buildViewHeightForm() {
    this.viewHeightForm = this.fb.group({
      viewHeight: [
        this.chart.view_height,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.viewHeight = this.viewHeightForm.controls['viewHeight'];
  }

  //

  duplicateChart() {
    let newMconfig: api.Mconfig = this.structService.generateMconfig();

    let newChart = Object.assign({}, this.chart, {
      chart_id: uuid.v4()
    });

    newMconfig.charts = [...newMconfig.charts, newChart];

    this.store.dispatch(
      new actions.CreateMconfigAction({
        api_payload: {
          mconfig: newMconfig
        },
        navigate: () => {
          this.navigateMconfigService.navigateMconfigQueryChart(
            newMconfig.mconfig_id,
            newMconfig.query_id,
            newChart.chart_id
          );
        }
      })
    );
  }

  removeChart() {
    let newMconfig: api.Mconfig = this.structService.generateMconfig();

    let chartId: string;
    this.store
      .select(selectors.getSelectedMconfigChartId)
      .pipe(take(1))
      .subscribe(x => (chartId = x));

    let chartIndex = newMconfig.charts.findIndex(x => x.chart_id === chartId);

    newMconfig.charts = [
      ...newMconfig.charts.slice(0, chartIndex),
      ...newMconfig.charts.slice(chartIndex + 1)
    ];

    this.store.dispatch(
      new actions.CreateMconfigAction({
        api_payload: {
          mconfig: newMconfig
        },
        navigate: () => {
          this.navigateMconfigService.navigateMconfigQueryData(
            newMconfig.mconfig_id,
            newMconfig.query_id
          );
        }
      })
    );
  }

  openGenerateBlockmlDialog() {
    this.myDialogService.showGenerateBlockmlDialog();
  }

  //

  typeChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      type: ev.value
    });

    this.chartChange();
  }

  // data

  xFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      x_field: ev.value
    });

    this.chartChange();
  }

  yFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      y_field: ev.value
    });

    this.chartChange();
  }

  multiFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      multi_field: ev.value
    });

    this.chartChange();
  }

  valueFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      value_field: ev.value
    });

    this.chartChange();
  }

  previousValueFieldChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      previous_value_field: ev.value
    });

    this.chartChange();
  }

  // axis

  toggleXAxis() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      x_axis: !this.chart.x_axis // !
    });

    this.chartChange();
  }

  toggleShowXAxisLabel() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_x_axis_label: !this.chart.show_x_axis_label // !
    });

    this.chartChange();
  }

  toggleYAxis() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      y_axis: !this.chart.y_axis // !
    });

    this.chartChange();
  }

  toggleShowYAxisLabel() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_y_axis_label: !this.chart.show_y_axis_label // !
    });

    this.chartChange();
  }

  toggleShowAxis() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_axis: !this.chart.show_axis // !
    });

    this.chartChange();
  }

  // options

  toggleAnimations() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      animations: !this.chart.animations // !
    });

    this.chartChange();
  }

  toggleGradient() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      gradient: !this.chart.gradient // !
    });

    this.chartChange();
  }

  toggleLegend() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      legend: !this.chart.legend // !
    });

    this.chartChange();
  }

  toggleTooltipDisabled() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      tooltip_disabled: !this.chart.tooltip_disabled // !
    });

    this.chartChange();
  }

  toggleRoundEdges() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      round_edges: !this.chart.round_edges // !
    });

    this.chartChange();
  }

  toggleRoundDomains() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      round_domains: !this.chart.round_domains // !
    });

    this.chartChange();
  }

  toggleShowGridLines() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_grid_lines: !this.chart.show_grid_lines // !
    });

    this.chartChange();
  }

  toggleTimeline() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      timeline: !this.chart.timeline // !
    });

    this.chartChange();
  }

  toggleAutoScale() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      auto_scale: !this.chart.auto_scale // !
    });

    this.chartChange();
  }

  toggleDoughnut() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      doughnut: !this.chart.doughnut // !
    });

    this.chartChange();
  }

  toggleExplodeSlices() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      explode_slices: !this.chart.explode_slices // !
    });

    this.chartChange();
  }

  toggleLabels() {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      labels: !this.chart.labels // !
    });

    this.chartChange();
  }

  interpolationChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      interpolation: ev.value
    });

    this.chartChange();
  }

  colorSchemeChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      color_scheme: ev.value
    });

    this.chartChange();
  }

  schemeTypeChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      scheme_type: ev.value
    });

    this.chartChange();
  }

  rangeFillOpacityBlur() {
    if (this.rangeFillOpacity.value !== this.chart.range_fill_opacity) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        range_fill_opacity: this.rangeFillOpacity.value
      });

      this.chartChange();
    }
  }

  bandColorChange(ev: MColorChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      band_color: ev.color
    });

    setTimeout(() => {
      this.chartChange();
    }, 1);
  }

  cardColorChange(ev: any) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      card_color: ev.color
    });

    setTimeout(() => {
      this.chartChange();
    }, 1);
  }

  textColorChange(ev: MColorChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      text_color: ev.color
    });

    setTimeout(() => {
      this.chartChange();
    }, 1);
  }

  emptyColorChange(ev: MColorChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      empty_color: ev.color
    });

    setTimeout(() => {
      this.chartChange();
    }, 1);
  }

  // tile

  tileWidthChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      tile_width: ev.value
    });

    this.chartChange();
  }

  tileHeightChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      tile_height: ev.value
    });

    this.chartChange();
  }

  viewSizeChange(ev: MatSelectChange) {
    this.chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      view_size: ev.value
    });

    this.chartChange();
  }

  viewHeightBlur() {
    if (this.viewHeight.value !== this.chart.view_height) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        view_height: this.viewHeight.value
      });

      this.chartChange();
    }
  }

  yFieldsIsSelected(id: string) {
    return this.chart.y_fields.findIndex(x => x === id) > -1;
  }

  hideColumnsIsSelected(id: string) {
    return this.chart.hide_columns.findIndex(x => x === id) > -1;
  }

  yFieldsOnClick(id: string) {
    let index = this.chart.y_fields.findIndex(x => x === id);

    if (index > -1) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_fields: [
          ...this.chart.y_fields.slice(0, index),
          ...this.chart.y_fields.slice(index + 1)
        ]
      });
    } else {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_fields: [...this.chart.y_fields, id]
      });
    }

    this.chartChange();
  }

  hideColumnsOnClick(id: string) {
    let index = this.chart.hide_columns.findIndex(x => x === id);

    if (index > -1) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        hide_columns: [
          ...this.chart.hide_columns.slice(0, index),
          ...this.chart.hide_columns.slice(index + 1)
        ]
      });
    } else {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        hide_columns: [...this.chart.hide_columns, id]
      });
    }

    this.chartChange();
  }

  //

  angleSpanChange(ev) {
    this.angleSpanValid = ev.angleSpanValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  arcWidthChange(ev) {
    this.arcWidthValid = ev.arcWidthValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  barPaddingChange(ev) {
    this.barPaddingValid = ev.barPaddingValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  bigSegmentsChange(ev) {
    this.bigSegmentsValid = ev.bigSegmentsValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  innerPaddingChange(ev) {
    this.innerPaddingValid = ev.innerPaddingValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  groupPaddingChange(ev) {
    this.groupPaddingValid = ev.groupPaddingValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  legendTitleChange(ev) {
    this.legendTitleValid = ev.legendTitleValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  maxChange(ev) {
    this.maxValid = ev.maxValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  minChange(ev) {
    this.minValid = ev.minValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  pageSizeChange(ev) {
    this.pageSizeValid = ev.pageSizeValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  smallSegmentsChange(ev) {
    this.smallSegmentsValid = ev.smallSegmentsValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  startAngleChange(ev) {
    this.startAngleValid = ev.startAngleValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  titleChange(ev) {
    this.titleValid = ev.titleValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  unitsChange(ev) {
    this.unitsValid = ev.unitsValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  viewWidthChange(ev) {
    this.viewWidthValid = ev.viewWidthValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  xAxisLabelChange(ev) {
    this.xAxisLabelValid = ev.xAxisLabelValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  xScaleMaxChange(ev) {
    this.xScaleMaxValid = ev.xScaleMaxValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  yAxisLabelChange(ev) {
    this.yAxisLabelValid = ev.yAxisLabelValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  yScaleMaxChange(ev) {
    this.yScaleMaxValid = ev.yScaleMaxValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  yScaleMinChange(ev) {
    this.yScaleMinValid = ev.yScaleMinValid;
    if (ev.chart) {
      this.chartChange(ev.chart);
    }
  }

  chartChange(chart?) {
    if (chart) {
      this.chart = chart;
    }

    this.chart.is_valid = this.isChartValid();

    let newMconfig: api.Mconfig = this.structService.generateMconfig();

    let chartId: string;
    this.store
      .select(selectors.getSelectedMconfigChartId)
      .pipe(take(1))
      .subscribe(x => (chartId = x));

    let chartIndex = newMconfig.charts.findIndex(x => x.chart_id === chartId);

    newMconfig.charts = [
      ...newMconfig.charts.slice(0, chartIndex),
      ...newMconfig.charts.slice(chartIndex + 1),
      this.chart
    ];

    this.store.dispatch(
      new actions.CreateMconfigAction({
        api_payload: {
          mconfig: newMconfig
        },
        navigate: () => {
          this.navigateMconfigService.navigateMconfigQueryChart(
            newMconfig.mconfig_id,
            newMconfig.query_id,
            this.chart.chart_id
          );
        }
      })
    );
  }

  isChartValid() {
    switch (this.chart.type) {
      case api.ChartTypeEnum.Table: {
        if (
          this.pageSizeValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVertical: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          this.legendTitleValid &&
          this.barPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.yScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontal: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          this.legendTitleValid &&
          this.barPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.xScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalGrouped: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.barPaddingValid &&
          this.groupPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.yScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalGrouped: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.barPaddingValid &&
          this.groupPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.xScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalStacked: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.barPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.yScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalStacked: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.barPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.xScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalNormalized: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.barPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalNormalized: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.barPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Pie: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          this.legendTitleValid &&
          this.arcWidthValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.PieAdvanced: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.legendTitleValid &&
          this.titleValid
        ) {
          return true;
        }
        break;
      }

      case api.ChartTypeEnum.PieGrid: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.legendTitleValid &&
          this.titleValid
        ) {
          return true;
        }
        break;
      }

      case api.ChartTypeEnum.Line: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.rangeFillOpacityForm.valid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.yScaleMinValid &&
          this.yScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Area: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.yScaleMinValid &&
          this.yScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.AreaStacked: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid &&
          this.yScaleMinValid &&
          this.yScaleMaxValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.AreaNormalized: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.HeatMap: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.innerPaddingValid &&
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.TreeMap: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.legendTitleValid &&
          this.titleValid
        ) {
          return true;
        }
        break;
      }

      case api.ChartTypeEnum.NumberCard: {
        if (
          this.chart.y_field &&
          this.innerPaddingValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Gauge: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          this.angleSpanValid &&
          this.startAngleValid &&
          this.bigSegmentsValid &&
          this.smallSegmentsValid &&
          this.minValid &&
          this.maxValid &&
          this.unitsValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.GaugeLinear: {
        if (
          this.chart.value_field &&
          this.minValid &&
          this.maxValid &&
          this.unitsValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthValid)) &&
          this.titleValid
        ) {
          return true;
        }

        break;
      }

      default: {
        return false;
      }
    }
  }
}
