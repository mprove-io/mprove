import { Component, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material';
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
export class ChartEditorComponent {
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

  chartTypeEnum = api.ChartTypeEnum;
  chartViewSizeEnum = api.ChartViewSizeEnum;

  @Input() chart: api.Chart;
  @Input() selectFields: api.ModelField[];

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
  viewHeightValid: boolean;

  constructor(
    private store: Store<interfaces.AppState>,
    private structService: services.StructService,
    private myDialogService: services.MyDialogService,
    private navigateMconfigService: services.NavigateService
  ) {}

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

  //

  delayChartChange(chart) {
    this.chart = chart;
    // wait until children components initialize and pass valid status to validate chart
    setTimeout(() => {
      this.chartChange();
    }, 0);
  }

  // data

  // axis

  toggleXAxis() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      x_axis: !this.chart.x_axis // !
    });

    this.delayChartChange(chart);
  }

  toggleShowXAxisLabel() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_x_axis_label: !this.chart.show_x_axis_label // !
    });

    this.delayChartChange(chart);
  }

  toggleYAxis() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      y_axis: !this.chart.y_axis // !
    });

    this.delayChartChange(chart);
  }

  toggleShowYAxisLabel() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_y_axis_label: !this.chart.show_y_axis_label // !
    });

    this.delayChartChange(chart);
  }

  toggleShowAxis() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_axis: !this.chart.show_axis // !
    });

    this.delayChartChange(chart);
  }

  // options

  toggleAnimations() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      animations: !this.chart.animations // !
    });

    this.delayChartChange(chart);
  }

  toggleGradient() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      gradient: !this.chart.gradient // !
    });

    this.delayChartChange(chart);
  }

  toggleLegend() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      legend: !this.chart.legend // !
    });

    this.delayChartChange(chart);
  }

  toggleTooltipDisabled() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      tooltip_disabled: !this.chart.tooltip_disabled // !
    });

    this.delayChartChange(chart);
  }

  toggleRoundEdges() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      round_edges: !this.chart.round_edges // !
    });

    this.delayChartChange(chart);
  }

  toggleRoundDomains() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      round_domains: !this.chart.round_domains // !
    });

    this.delayChartChange(chart);
  }

  toggleShowGridLines() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      show_grid_lines: !this.chart.show_grid_lines // !
    });

    this.delayChartChange(chart);
  }

  toggleTimeline() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      timeline: !this.chart.timeline // !
    });

    this.delayChartChange(chart);
  }

  toggleAutoScale() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      auto_scale: !this.chart.auto_scale // !
    });

    this.delayChartChange(chart);
  }

  toggleDoughnut() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      doughnut: !this.chart.doughnut // !
    });

    this.delayChartChange(chart);
  }

  toggleExplodeSlices() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      explode_slices: !this.chart.explode_slices // !
    });

    this.delayChartChange(chart);
  }

  toggleLabels() {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      labels: !this.chart.labels // !
    });

    this.delayChartChange(chart);
  }

  bandColorChange(ev: MColorChange) {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      band_color: ev.color
    });

    this.delayChartChange(chart);
  }

  cardColorChange(ev: any) {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      card_color: ev.color
    });

    this.delayChartChange(chart);
  }

  textColorChange(ev: MColorChange) {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      text_color: ev.color
    });

    this.delayChartChange(chart);
  }

  emptyColorChange(ev: MColorChange) {
    let chart = Object.assign({}, this.chart, {
      chart_id: uuid.v4(),
      empty_color: ev.color
    });

    this.delayChartChange(chart);
  }

  // tile

  hideColumnsIsSelected(id: string) {
    return this.chart.hide_columns.findIndex(x => x === id) > -1;
  }

  hideColumnsOnClick(id: string) {
    let index = this.chart.hide_columns.findIndex(x => x === id);

    let chart;

    if (index > -1) {
      chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        hide_columns: [
          ...this.chart.hide_columns.slice(0, index),
          ...this.chart.hide_columns.slice(index + 1)
        ]
      });
    } else {
      chart = Object.assign({}, this.chart, {
        chart_id: uuid.v4(),
        hide_columns: [...this.chart.hide_columns, id]
      });
    }

    this.delayChartChange(chart);
  }

  //

  angleSpanChange(ev) {
    this.angleSpanValid = ev.angleSpanValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  arcWidthChange(ev) {
    this.arcWidthValid = ev.arcWidthValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  barPaddingChange(ev) {
    this.barPaddingValid = ev.barPaddingValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  bigSegmentsChange(ev) {
    this.bigSegmentsValid = ev.bigSegmentsValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  innerPaddingChange(ev) {
    this.innerPaddingValid = ev.innerPaddingValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  groupPaddingChange(ev) {
    this.groupPaddingValid = ev.groupPaddingValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  legendTitleChange(ev) {
    this.legendTitleValid = ev.legendTitleValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  maxChange(ev) {
    this.maxValid = ev.maxValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  minChange(ev) {
    this.minValid = ev.minValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  pageSizeChange(ev) {
    this.pageSizeValid = ev.pageSizeValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  smallSegmentsChange(ev) {
    this.smallSegmentsValid = ev.smallSegmentsValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  startAngleChange(ev) {
    this.startAngleValid = ev.startAngleValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  titleChange(ev) {
    this.titleValid = ev.titleValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  unitsChange(ev) {
    this.unitsValid = ev.unitsValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  viewHeightChange(ev) {
    this.viewHeightValid = ev.viewHeightValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  viewWidthChange(ev) {
    this.viewWidthValid = ev.viewWidthValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  xAxisLabelChange(ev) {
    this.xAxisLabelValid = ev.xAxisLabelValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  xScaleMaxChange(ev) {
    this.xScaleMaxValid = ev.xScaleMaxValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  yAxisLabelChange(ev) {
    this.yAxisLabelValid = ev.yAxisLabelValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  yScaleMaxChange(ev) {
    this.yScaleMaxValid = ev.yScaleMaxValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  yScaleMinChange(ev) {
    this.yScaleMinValid = ev.yScaleMinValid;
    if (ev.chart) {
      this.delayChartChange(ev.chart);
    }
  }

  isChartValid() {
    switch (this.chart.type) {
      case api.ChartTypeEnum.Table: {
        if (
          this.pageSizeValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
          this.xAxisLabelValid &&
          this.yAxisLabelValid &&
          (this.chart.view_size === api.ChartViewSizeEnum.Auto ||
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
            (this.viewHeightValid && this.viewWidthValid)) &&
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
