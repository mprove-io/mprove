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

  titleForm: FormGroup;
  title: AbstractControl;

  xAxisLabelForm: FormGroup;
  xAxisLabel: AbstractControl;

  yAxisLabelForm: FormGroup;
  yAxisLabel: AbstractControl;

  pageSizeForm: FormGroup;
  pageSize: AbstractControl;

  arcWidthForm: FormGroup;
  arcWidth: AbstractControl;

  barPaddingForm: FormGroup;
  barPadding: AbstractControl;

  groupPaddingForm: FormGroup;
  groupPadding: AbstractControl;

  innerPaddingForm: FormGroup;
  innerPadding: AbstractControl;

  rangeFillOpacityForm: FormGroup;
  rangeFillOpacity: AbstractControl;

  angleSpanForm: FormGroup;
  angleSpan: AbstractControl;

  startAngleForm: FormGroup;
  startAngle: AbstractControl;

  yScaleMinForm: FormGroup;
  yScaleMin: AbstractControl;

  yScaleMaxForm: FormGroup;
  yScaleMax: AbstractControl;

  xScaleMaxForm: FormGroup;
  xScaleMax: AbstractControl;

  bigSegmentsForm: FormGroup;
  bigSegments: AbstractControl;

  smallSegmentsForm: FormGroup;
  smallSegments: AbstractControl;

  minForm: FormGroup;
  min: AbstractControl;

  maxForm: FormGroup;
  max: AbstractControl;

  unitsForm: FormGroup;
  units: AbstractControl;

  legendTitleForm: FormGroup;
  legendTitle: AbstractControl;

  viewWidthForm: FormGroup;
  viewWidth: AbstractControl;

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
    this.buildTitleForm();

    this.buildXAxisLabelForm();
    this.buildYAxisLabelForm();

    this.buildPageSizeForm();

    this.buildArcWidthForm();

    this.buildBarPaddingForm();
    this.buildGroupPaddingForm();
    this.buildInnerPaddingForm();

    this.buildRangeFillOpacityForm();

    this.buildAngleSpanForm();
    this.buildStartAngleForm();
    this.buildYScaleMinForm();
    this.buildYScaleMaxForm();
    this.buildXScaleMaxForm();
    this.buildBigSegmentsForm();
    this.buildSmallSegmentsForm();

    this.buildMinForm();
    this.buildMaxForm();
    this.buildUnitsForm();
    this.buildLegendTitleForm();

    this.buildViewWidthForm();
    this.buildViewHeightForm();
  }

  buildTitleForm() {
    this.titleForm = this.fb.group({
      title: [
        this.chart.title,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });

    this.title = this.titleForm.controls['title'];
  }

  buildXAxisLabelForm() {
    this.xAxisLabelForm = this.fb.group({
      xAxisLabel: [
        this.chart.x_axis_label,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });

    this.xAxisLabel = this.xAxisLabelForm.controls['xAxisLabel'];
  }

  buildYAxisLabelForm() {
    this.yAxisLabelForm = this.fb.group({
      yAxisLabel: [
        this.chart.y_axis_label,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });

    this.yAxisLabel = this.yAxisLabelForm.controls['yAxisLabel'];
  }

  buildPageSizeForm() {
    this.pageSizeForm = this.fb.group({
      pageSize: [
        this.chart.page_size,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0),
          Validators.maxLength(255)
        ])
      ]
    });

    this.pageSize = this.pageSizeForm.controls['pageSize'];
  }

  buildArcWidthForm() {
    this.arcWidthForm = this.fb.group({
      arcWidth: [
        this.chart.arc_width,
        Validators.compose([
          Validators.required,
          services.ValidationService.numberValidator,
          Validators.min(0)
        ])
      ]
    });

    this.arcWidth = this.arcWidthForm.controls['arcWidth'];
  }

  buildBarPaddingForm() {
    this.barPaddingForm = this.fb.group({
      barPadding: [
        this.chart.bar_padding,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.barPadding = this.barPaddingForm.controls['barPadding'];
  }

  buildGroupPaddingForm() {
    this.groupPaddingForm = this.fb.group({
      groupPadding: [
        this.chart.group_padding,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.groupPadding = this.groupPaddingForm.controls['groupPadding'];
  }

  buildInnerPaddingForm() {
    this.innerPaddingForm = this.fb.group({
      innerPadding: [
        this.chart.inner_padding,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.innerPadding = this.innerPaddingForm.controls['innerPadding'];
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

  buildAngleSpanForm() {
    this.angleSpanForm = this.fb.group({
      angleSpan: [
        this.chart.angle_span,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.angleSpan = this.angleSpanForm.controls['angleSpan'];
  }

  buildStartAngleForm() {
    this.startAngleForm = this.fb.group({
      startAngle: [
        this.chart.start_angle,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator
        ])
      ]
    });

    this.startAngle = this.startAngleForm.controls['startAngle'];
  }

  buildYScaleMinForm() {
    this.yScaleMinForm = this.fb.group({
      yScaleMin: [
        this.chart.y_scale_min,
        Validators.compose([services.ValidationService.numberValidator])
      ]
    });

    this.yScaleMin = this.yScaleMinForm.controls['yScaleMin'];
  }

  buildYScaleMaxForm() {
    this.yScaleMaxForm = this.fb.group({
      yScaleMax: [
        this.chart.y_scale_max,
        Validators.compose([services.ValidationService.numberValidator])
      ]
    });

    this.yScaleMax = this.yScaleMaxForm.controls['yScaleMax'];
  }

  buildXScaleMaxForm() {
    this.xScaleMaxForm = this.fb.group({
      xScaleMax: [
        this.chart.x_scale_max,
        Validators.compose([services.ValidationService.numberValidator])
      ]
    });

    this.xScaleMax = this.xScaleMaxForm.controls['xScaleMax'];
  }

  buildBigSegmentsForm() {
    this.bigSegmentsForm = this.fb.group({
      bigSegments: [
        this.chart.big_segments,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.bigSegments = this.bigSegmentsForm.controls['bigSegments'];
  }

  buildSmallSegmentsForm() {
    this.smallSegmentsForm = this.fb.group({
      smallSegments: [
        this.chart.small_segments,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.smallSegments = this.smallSegmentsForm.controls['smallSegments'];
  }

  buildMinForm() {
    this.minForm = this.fb.group({
      min: [
        this.chart.min,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator
        ])
      ]
    });

    this.min = this.minForm.controls['min'];
  }

  buildMaxForm() {
    this.maxForm = this.fb.group({
      max: [
        this.chart.max,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator
        ])
      ]
    });

    this.max = this.maxForm.controls['max'];
  }

  buildUnitsForm() {
    this.unitsForm = this.fb.group({
      units: [
        this.chart.units,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });

    this.units = this.unitsForm.controls['units'];
  }

  buildLegendTitleForm() {
    this.legendTitleForm = this.fb.group({
      legendTitle: [
        this.chart.legend_title,
        Validators.compose([
          // Validators.required,
          Validators.maxLength(255)
        ])
      ]
    });

    this.legendTitle = this.legendTitleForm.controls['legendTitle'];
  }

  buildViewWidthForm() {
    this.viewWidthForm = this.fb.group({
      viewWidth: [
        this.chart.view_width,
        Validators.compose([
          Validators.required,
          services.ValidationService.integerValidator,
          Validators.min(0)
        ])
      ]
    });

    this.viewWidth = this.viewWidthForm.controls['viewWidth'];
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

    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(
      new actions.CreateMconfigAction({ mconfig: newMconfig })
    );

    setTimeout(
      () =>
        this.navigateMconfigService.navigateMconfigQueryChart(
          newMconfig.mconfig_id,
          newMconfig.query_id,
          newChart.chart_id
        ),
      1
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

    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(
      new actions.CreateMconfigAction({ mconfig: newMconfig })
    );

    setTimeout(
      () =>
        this.navigateMconfigService.navigateMconfigQueryData(
          newMconfig.mconfig_id,
          newMconfig.query_id
        ),
      1
    );
  }

  openGenerateBlockmlDialog() {
    this.myDialogService.showGenerateBlockmlDialog();
  }

  //

  titleBlur() {
    if (this.title.value !== this.chart.title) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        title: this.title.value
      });

      this.chartChange();
    }
  }

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

  xAxisLabelBlur() {
    if (this.xAxisLabel.value !== this.chart.x_axis_label) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        x_axis_label: this.xAxisLabel.value
      });

      this.chartChange();
    }
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

  yAxisLabelBlur() {
    if (this.yAxisLabel.value !== this.chart.y_axis_label) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_axis_label: this.yAxisLabel.value
      });

      this.chartChange();
    }
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

  pageSizeBlur() {
    if (this.pageSize.value !== this.chart.page_size) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        page_size: this.pageSize.value
      });

      this.chartChange();
    }
  }

  arcWidthBlur() {
    if (this.arcWidth.value !== this.chart.arc_width) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        arc_width: this.arcWidth.value
      });

      this.chartChange();
    }
  }

  barPaddingBlur() {
    if (this.barPadding.value !== this.chart.bar_padding) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        bar_padding: this.barPadding.value
      });

      this.chartChange();
    }
  }

  groupPaddingBlur() {
    if (this.groupPadding.value !== this.chart.group_padding) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        group_padding: this.groupPadding.value
      });

      this.chartChange();
    }
  }

  innerPaddingBlur() {
    if (this.innerPadding.value !== this.chart.inner_padding) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        inner_padding: this.innerPadding.value
      });

      this.chartChange();
    }
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

  angleSpanBlur() {
    if (this.angleSpan.value !== this.chart.angle_span) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        angle_span: this.angleSpan.value
      });

      this.chartChange();
    }
  }

  startAngleBlur() {
    if (this.startAngle.value !== this.chart.start_angle) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        start_angle: this.startAngle.value
      });

      this.chartChange();
    }
  }

  yScaleMinBlur() {
    if (this.yScaleMin.value !== this.chart.y_scale_min) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_scale_min: this.yScaleMin.value
      });

      this.chartChange();
    }
  }

  yScaleMaxBlur() {
    if (this.yScaleMax.value !== this.chart.y_scale_max) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        y_scale_max: this.yScaleMax.value
      });

      this.chartChange();
    }
  }

  xScaleMaxBlur() {
    if (this.xScaleMax.value !== this.chart.x_scale_max) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        x_scale_max: this.xScaleMax.value
      });

      this.chartChange();
    }
  }

  bigSegmentsBlur() {
    if (this.bigSegments.value !== this.chart.big_segments) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        big_segments: this.bigSegments.value
      });

      this.chartChange();
    }
  }

  smallSegmentsBlur() {
    if (this.smallSegments.value !== this.chart.small_segments) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        small_segments: this.smallSegments.value
      });

      this.chartChange();
    }
  }

  minBlur() {
    if (this.min.value !== this.chart.min) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        min: this.min.value
      });

      this.chartChange();
    }
  }

  maxBlur() {
    if (this.max.value !== this.chart.max) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        max: this.max.value
      });

      this.chartChange();
    }
  }

  unitsBlur() {
    if (this.units.value !== this.chart.units) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        units: this.units.value
      });

      this.chartChange();
    }
  }

  legendTitleBlur() {
    if (this.legendTitle.value !== this.chart.legend_title) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        legend_title: this.legendTitle.value
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

  viewWidthBlur() {
    if (this.viewWidth.value !== this.chart.view_width) {
      this.chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        view_width: this.viewWidth.value
      });

      this.chartChange();
    }
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

  chartChange() {
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

    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));
    this.store.dispatch(
      new actions.CreateMconfigAction({ mconfig: newMconfig })
    );

    setTimeout(
      () =>
        this.navigateMconfigService.navigateMconfigQueryChart(
          newMconfig.mconfig_id,
          newMconfig.query_id,
          this.chart.chart_id
        ),
      1
    );
  }

  isChartValid() {
    switch (this.chart.type) {
      case api.ChartTypeEnum.Table: {
        if (
          this.pageSizeForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVertical: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          this.legendTitleForm.valid &&
          this.barPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.yScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontal: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          this.legendTitleForm.valid &&
          this.barPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.xScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalGrouped: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.barPaddingForm.valid &&
          this.groupPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.yScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalGrouped: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.barPaddingForm.valid &&
          this.groupPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.xScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalStacked: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.barPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.yScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalStacked: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.barPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.xScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarVerticalNormalized: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.barPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.BarHorizontalNormalized: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.barPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Pie: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          this.legendTitleForm.valid &&
          this.arcWidthForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
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
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.legendTitleForm.valid &&
          this.titleForm.valid
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
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.legendTitleForm.valid &&
          this.titleForm.valid
        ) {
          return true;
        }
        break;
      }

      case api.ChartTypeEnum.Line: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.rangeFillOpacityForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.yScaleMinForm.valid &&
          this.yScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Area: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.yScaleMinForm.valid &&
          this.yScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.AreaStacked: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid &&
          this.yScaleMinForm.valid &&
          this.yScaleMaxForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.AreaNormalized: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.HeatMap: {
        if (
          this.chart.x_field &&
          this.chart.y_fields.length > 0 &&
          this.legendTitleForm.valid &&
          this.innerPaddingForm.valid &&
          this.xAxisLabelForm.valid &&
          this.yAxisLabelForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
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
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.legendTitleForm.valid &&
          this.titleForm.valid
        ) {
          return true;
        }
        break;
      }

      case api.ChartTypeEnum.NumberCard: {
        if (
          this.chart.y_field &&
          this.innerPaddingForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.Gauge: {
        if (
          this.chart.x_field &&
          this.chart.y_field &&
          this.angleSpanForm.valid &&
          this.startAngleForm.valid &&
          this.bigSegmentsForm.valid &&
          this.smallSegmentsForm.valid &&
          this.minForm.valid &&
          this.maxForm.valid &&
          this.unitsForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
        ) {
          return true;
        }

        break;
      }

      case api.ChartTypeEnum.GaugeLinear: {
        if (
          this.chart.value_field &&
          this.minForm.valid &&
          this.maxForm.valid &&
          this.unitsForm.valid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightForm.valid && this.viewWidthForm.valid)) &&
          this.titleForm.valid
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
