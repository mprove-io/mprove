import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { format, formatDefaultLocale } from 'd3-format';
import * as shape from 'd3-shape';
import { filter, tap, debounceTime } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';
import { ChartIconPipe } from '@app/pipes/chart-icon.pipe';

@Component({
  moduleId: module.id,
  selector: 'm-visual',
  templateUrl: 'visual.component.html',
  styleUrls: ['visual.component.scss']
})
export class VisualComponent implements OnChanges {
  dashThemeEnum = api.MemberDashThemeEnum;

  chartTypeEnum = api.ChartTypeEnum;

  @Input() visual: interfaces.Visual;

  // @Input() data: any;
  // @Input() chart: Chart;
  // @Input() selectFields: ModelField[];

  chart: api.Chart;
  selectFields: api.ModelField[];
  lastCompleteTs: number;
  data: any[] = [];

  fromRow: number = 1;
  currentPage: number = 1;

  single: any[] = [];
  multi: any[] = [];
  value: number;
  previousValue: number;

  // xAxisTickFormatting: ...
  // yAxisTickFormatting: ...
  // axisTickFormatting: ...
  // activeEntries: ...
  // curve: ...
  // customColors: ...
  // labelFormatting: ...
  // tooltipText: ...
  // valueFormatting: ...

  type: api.ChartTypeEnum;

  // data
  xField: string;
  yField: string;
  yFields: string[] = [];
  hideColumns: string[] = [];
  multiField: string;
  valueField: string;
  previousValueField: string;

  // axis
  xAxis: boolean;
  showXAxisLabel: boolean;
  xAxisLabel: string;

  yAxis: boolean;
  yAxisLabel: string;
  showYAxisLabel: boolean;

  showAxis: boolean;

  // options
  animations: boolean;

  gradient: boolean;

  legend: boolean;
  legendTitle: string;

  tooltipDisabled: boolean;

  roundEdges: boolean;
  roundDomains: boolean;
  showGridLines: boolean;

  timeline: boolean;
  interpolation: api.ChartInterpolationEnum;

  autoScale: boolean;

  doughnut: boolean;
  explodeSlices: boolean;
  labels: boolean;

  scheme: any;

  schemeType: api.ChartSchemeTypeEnum;

  pageSize: number;

  arcWidth: number;

  barPadding: number;
  groupPadding: number;
  innerPadding: number;

  rangeFillOpacity: number;

  angleSpan: number;
  startAngle: number;
  bigSegments: number;
  smallSegments: number;

  min: number;
  max: number;
  units: string;

  yScaleMin: number;
  xScaleMax: number;
  yScaleMax: number;

  bandColor: string;
  cardColor: string;
  textColor: string;
  emptyColor: string;

  // tile
  view: number[];

  dashTheme: api.MemberDashThemeEnum = null;
  dashTheme$ = this.store
    .select(selectors.getSelectedProjectUserDashTheme)
    .pipe(
      filter(v => !!v),
      debounceTime(1),
      tap(x => (this.dashTheme = x))
    );

  curve: any;
  curves = {
    basis: shape.curveBasis,
    basis_closed: shape.curveBasisClosed,
    bundle: shape.curveBundle.beta(1),
    cardinal: shape.curveCardinal,
    cardinal_closed: shape.curveCardinalClosed,
    catmull_rom: shape.curveCatmullRom,
    catmull_rom_closed: shape.curveCatmullRomClosed,
    linear: shape.curveLinear,
    linear_closed: shape.curveLinearClosed,
    monotone_x: shape.curveMonotoneX,
    monotone_y: shape.curveMonotoneY,
    natural: shape.curveNatural,
    step: shape.curveStep,
    step_after: shape.curveStepAfter,
    step_before: shape.curveStepBefore
  };

  constructor(
    private store: Store<interfaces.AppState>,
    private dataService: services.DataService,
    private chartIconPipe: ChartIconPipe
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      !this.chart ||
      this.chart.chart_id !== this.visual.chart.chart_id ||
      !this.selectFields ||
      JSON.stringify(this.selectFields.map(s => s.id)) !==
        JSON.stringify(this.visual.select_fields.map(s => s.id))
    ) {
      this.selectFields = this.visual.select_fields;
      this.chart = this.visual.chart;
      this.changeChart();

      this.lastCompleteTs = this.visual.query.last_complete_ts;
      this.data = this.visual.query.data
        ? JSON.parse(this.visual.query.data)
        : [];
      this.changeData();
    } else if (
      !this.lastCompleteTs ||
      this.lastCompleteTs !== this.visual.query.last_complete_ts
    ) {
      this.lastCompleteTs = this.visual.query.last_complete_ts;
      this.data = this.visual.query.data
        ? JSON.parse(this.visual.query.data)
        : [];
      this.changeData();
    }
  }

  changeChart(): void {
    // this.xAxisTickFormatting = ...
    // this.yAxisTickFormatting = ...
    // this.axisTickFormatting = ...
    // this.activeEntries = ...
    // this.curve = ...
    // this.customColors = ...
    // this.labelFormatting = ...
    // this.tooltipText = ...
    // this.valueFormatting = ...

    this.type = this.chart.type;

    // data
    this.xField = this.chart.x_field;
    this.yField = this.chart.y_field;
    this.yFields = this.chart.y_fields;
    this.hideColumns = this.chart.hide_columns;
    this.multiField = this.chart.multi_field;
    this.valueField = this.chart.value_field;
    this.previousValueField = this.chart.previous_value_field;

    // axis
    this.xAxis = this.chart.x_axis;
    this.showXAxisLabel = this.chart.show_x_axis_label;
    this.xAxisLabel = this.chart.x_axis_label;

    this.yAxis = this.chart.y_axis;
    this.showYAxisLabel = this.chart.show_y_axis_label;
    this.yAxisLabel = this.chart.y_axis_label;

    this.showAxis = this.chart.show_axis;

    // options
    this.animations = this.chart.animations;

    this.gradient = this.chart.gradient;

    this.legend = this.chart.legend;
    this.legendTitle = this.chart.legend_title;

    this.tooltipDisabled = this.chart.tooltip_disabled;

    this.roundEdges = this.chart.round_edges;
    this.roundDomains = this.chart.round_domains;
    this.showGridLines = this.chart.show_grid_lines;

    this.timeline = this.chart.timeline;
    this.interpolation = this.chart.interpolation;
    this.curve = (<any>this.curves)[this.chart.interpolation];

    this.autoScale = this.chart.auto_scale;

    this.doughnut = this.chart.doughnut;
    this.explodeSlices = this.chart.explode_slices;
    this.labels = this.chart.labels;

    this.schemeType = this.chart.scheme_type;

    this.pageSize = this.chart.page_size;

    this.arcWidth = this.chart.arc_width;

    this.barPadding = this.chart.bar_padding;
    this.groupPadding = this.chart.group_padding;
    this.innerPadding = this.chart.inner_padding;

    this.rangeFillOpacity = this.chart.range_fill_opacity;

    this.angleSpan = this.chart.angle_span;
    this.startAngle = this.chart.start_angle;
    this.bigSegments = this.chart.big_segments;
    this.smallSegments = this.chart.small_segments;

    this.min = this.chart.min;
    this.max = this.chart.max;
    this.units = this.chart.units;

    this.yScaleMin = this.chart.y_scale_min;
    this.yScaleMax = this.chart.y_scale_max;
    this.xScaleMax = this.chart.x_scale_max;

    this.bandColor = this.chart.band_color;
    this.cardColor = this.chart.card_color;
    this.textColor = this.chart.text_color;
    this.emptyColor = this.chart.empty_color;

    // tile
    this.view =
      this.chart.view_size === api.ChartViewSizeEnum.Manual
        ? [this.chart.view_width, this.chart.view_height]
        : null;

    // color_scheme
    switch (this.chart.color_scheme) {
      case api.ChartColorSchemeEnum.Vivid: {
        this.scheme = {
          domain: [
            '#647c8a',
            '#3f51b5',
            '#2196f3',
            '#00b862',
            '#afdf0a',
            '#a7b61a',
            '#f3e562',
            '#ff9800',
            '#ff5722',
            '#ff4514'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Natural: {
        this.scheme = {
          domain: [
            '#bf9d76',
            '#e99450',
            '#d89f59',
            '#f2dfa7',
            '#a5d7c6',
            '#7794b1',
            '#afafaf',
            '#707160',
            '#ba9383',
            '#d9d5c3'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Cool: {
        this.scheme = {
          domain: [
            '#a8385d',
            '#7aa3e5',
            '#a27ea8',
            '#aae3f5',
            '#adcded',
            '#a95963',
            '#8796c0',
            '#7ed3ed',
            '#50abcc',
            '#ad6886'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Fire: {
        this.scheme = {
          domain: [
            '#ff3d00',
            '#bf360c',
            '#ff8f00',
            '#ff6f00',
            '#ff5722',
            '#e65100',
            '#ffca28',
            '#ffab00'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Solar: {
        this.scheme = {
          domain: [
            '#fff8e1',
            '#ffecb3',
            '#ffe082',
            '#ffd54f',
            '#ffca28',
            '#ffc107',
            '#ffb300',
            '#ffa000',
            '#ff8f00',
            '#ff6f00'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Air: {
        this.scheme = {
          domain: [
            '#e1f5fe',
            '#b3e5fc',
            '#81d4fa',
            '#4fc3f7',
            '#29b6f6',
            '#03a9f4',
            '#039be5',
            '#0288d1',
            '#0277bd',
            '#01579b'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Aqua: {
        this.scheme = {
          domain: [
            '#e0f7fa',
            '#b2ebf2',
            '#80deea',
            '#4dd0e1',
            '#26c6da',
            '#00bcd4',
            '#00acc1',
            '#0097a7',
            '#00838f',
            '#006064'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Flame: {
        this.scheme = {
          domain: [
            '#A10A28',
            '#D3342D',
            '#EF6D49',
            '#FAAD67',
            '#FDDE90',
            '#DBED91',
            '#A9D770',
            '#6CBA67',
            '#2C9653',
            '#146738'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Ocean: {
        this.scheme = {
          domain: [
            '#1D68FB',
            '#33C0FC',
            '#4AFFFE',
            '#AFFFFF',
            '#FFFC63',
            '#FDBD2D',
            '#FC8A25',
            '#FA4F1E',
            '#FA141B',
            '#BA38D1'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Forest: {
        this.scheme = {
          domain: [
            '#55C22D',
            '#C1F33D',
            '#3CC099',
            '#AFFFFF',
            '#8CFC9D',
            '#76CFFA',
            '#BA60FB',
            '#EE6490',
            '#C42A1C',
            '#FC9F32'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Horizon: {
        this.scheme = {
          domain: [
            '#2597FB',
            '#65EBFD',
            '#99FDD0',
            '#FCEE4B',
            '#FEFCFA',
            '#FDD6E3',
            '#FCB1A8',
            '#EF6F7B',
            '#CB96E8',
            '#EFDEE0'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Neons: {
        this.scheme = {
          domain: [
            '#2597FB',
            '#65EBFD',
            '#99FDD0',
            '#FCEE4B',
            '#FEFCFA',
            '#FDD6E3',
            '#FCB1A8',
            '#EF6F7B',
            '#CB96E8',
            '#EFDEE0'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Picnic: {
        this.scheme = {
          domain: [
            '#FAC51D',
            '#66BD6D',
            '#FAA026',
            '#29BB9C',
            '#E96B56',
            '#55ACD2',
            '#B7332F',
            '#2C83C9',
            '#9166B8',
            '#92E7E8'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.Night: {
        this.scheme = {
          domain: [
            '#2B1B5A',
            '#501356',
            '#183356',
            '#28203F',
            '#391B3C',
            '#1E2B3C',
            '#120634',
            '#2D0432',
            '#051932',
            '#453080',
            '#75267D',
            '#2C507D',
            '#4B3880',
            '#752F7D',
            '#35547D'
          ]
        };
        break;
      }

      case api.ChartColorSchemeEnum.NightLights: {
        this.scheme = {
          domain: [
            '#4e31a5',
            '#9c25a7',
            '#3065ab',
            '#57468b',
            '#904497',
            '#46648b',
            '#32118d',
            '#a00fb3',
            '#1052a2',
            '#6e51bd',
            '#b63cc3',
            '#6c97cb',
            '#8671c1',
            '#b455be',
            '#7496c3'
          ]
        };
        break;
      }

      default: {
      }
    }
  }

  changeData(): void {
    // results (single, multi)
    switch (this.type) {
      case api.ChartTypeEnum.BarVertical: {
        this.single = this.dataService.getSingleData(
          this.selectFields,
          this.data,
          this.xField,
          this.yField
        );
        break;
      }

      case api.ChartTypeEnum.BarHorizontal: {
        this.single = this.dataService.getSingleData(
          this.selectFields,
          this.data,
          this.xField,
          this.yField
        );
        break;
      }

      case api.ChartTypeEnum.BarVerticalGrouped: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.BarHorizontalGrouped: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.BarVerticalStacked: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.BarHorizontalStacked: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.BarVerticalNormalized: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.BarHorizontalNormalized: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.Pie: {
        this.single = this.dataService.getSingleData(
          this.selectFields,
          this.data,
          this.xField,
          this.yField
        );
        break;
      }

      case api.ChartTypeEnum.PieAdvanced: {
        this.single = this.dataService.getSingleData(
          this.selectFields,
          this.data,
          this.xField,
          this.yField
        );
        break;
      }

      case api.ChartTypeEnum.PieGrid: {
        this.single = this.dataService.getSingleData(
          this.selectFields,
          this.data,
          this.xField,
          this.yField
        );
        break;
      }

      case api.ChartTypeEnum.Line: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.Area: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.AreaStacked: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.AreaNormalized: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.HeatMap: {
        this.multi = this.dataService.getMultiData(
          this.selectFields,
          this.data,
          this.multiField,
          this.xField,
          this.yFields
        );
        break;
      }

      case api.ChartTypeEnum.TreeMap: {
        this.single = this.dataService.getSingleData(
          this.selectFields,
          this.data,
          this.xField,
          this.yField
        );
        break;
      }

      case api.ChartTypeEnum.NumberCard: {
        this.single = this.dataService.getSingleDataForNumberCard({
          selectFields: this.selectFields,
          data: this.data,
          xFieldId: this.xField,
          yFieldId: this.yField
        });
        break;
      }

      case api.ChartTypeEnum.Gauge: {
        this.single = this.dataService.getSingleData(
          this.selectFields,
          this.data,
          this.xField,
          this.yField
        );
        break;
      }

      case api.ChartTypeEnum.GaugeLinear: {
        [this.value, this.previousValue] = this.dataService.getValueData(
          this.selectFields,
          this.data,
          this.valueField,
          this.previousValueField
        );
        break;
      }

      default: {
      }
    }
  }

  onSelect(event: any) {
    // console.log(event);
  }

  formatValue(
    value: string,
    formatNumber: string,
    fieldResult: api.ModelFieldResultEnum,
    currencyPrefix: string,
    currencySuffix: string
  ) {
    if (
      fieldResult === api.ModelFieldResultEnum.Number &&
      formatNumber !== null
    ) {
      formatDefaultLocale({
        decimal: '.',
        thousands: ',',
        grouping: [3],
        currency: [currencyPrefix, currencySuffix]
      });

      return format(formatNumber)(value);
    } else {
      return value;
    }
  }

  transformIcon(type: any) {
    // console.log(event);
    return '/assets/app/charts/' + this.chartIconPipe.transform(type) + '.svg';
  }
}
