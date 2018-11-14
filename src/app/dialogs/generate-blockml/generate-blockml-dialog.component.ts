import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Store } from '@ngrx/store';
import 'brace';
import 'brace/ext/searchbox';
import 'brace/mode/yaml';
import 'brace/theme/chrome';
import 'brace/theme/solarized_dark';
import * as y from 'js-yaml';
import { AceEditorComponent } from 'ng2-ace-editor';
import { filter, take, tap } from 'rxjs/operators';
import * as api from 'app/api/_index';
import * as constants from 'app/constants/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-generate-blockml-dialog',
  templateUrl: 'generate-blockml-dialog.component.html',
  styleUrls: ['generate-blockml-dialog.component.scss']
})
export class GenerateBlockmlDialogComponent implements OnInit, AfterViewInit {
  fileEditorTheme: string = 'chrome';
  reportYaml: string;

  @ViewChild('editor') editor: AceEditorComponent;

  fileEditorTheme$ = this.store
    .select(selectors.getSelectedProjectUserFileTheme)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.fileEditorTheme =
          x === api.MemberFileThemeEnum.Light ? 'chrome' : 'solarized_dark';
        if (this.editor !== null) {
          this.editor.setTheme(this.fileEditorTheme);
        }
      })
    );

  constructor(
    public dialogRef: MatDialogRef<GenerateBlockmlDialogComponent>,
    private store: Store<interfaces.AppState>
  ) {}

  ngOnInit() {
    let rep = this.prepareReport();

    this.reportYaml = y
      .safeDump({ reports: [rep] })
      .split('\n')
      .map(s =>
        s
          .replace(/^\s\s/g, '')
          .replace(/^\s\s\s\s[-]/g, '  -')
          .replace(/^\s\s\s\s\s\s[-]/g, '    -')
          // tslint:disable-next-line:quotemark
          .replace(/'''/g, "'")
      )
      .slice(1)
      .join('\n');
  }

  ngAfterViewInit() {
    this.editor.getEditor().gotoLine(1);
    this.editor.getEditor().navigateLineEnd();

    this.editor.getEditor().$blockScrolling = Infinity; // TODO: update ace later (1 instead of 2 by using this line)
    this.editor.getEditor().setFontSize(16);

    this.editor.getEditor().renderer.$cursorLayer.element.style.display =
      'none';

    this.editor.setOptions({
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false
    });

    this.editor.setTheme(this.fileEditorTheme);

    this.editor.setMode('yaml');
  }

  prepareReport() {
    let mconfig: api.Mconfig;
    this.store
      .select(selectors.getSelectedMconfig)
      .pipe(take(1))
      .subscribe(x => (mconfig = x));

    let chartId: string;
    this.store
      .select(selectors.getSelectedMconfigChartId)
      .pipe(take(1))
      .subscribe(x => (chartId = x));

    let chartIndex = mconfig.charts.findIndex(c => c.chart_id === chartId);

    let chart = mconfig.charts[chartIndex];

    let rep: any;

    // title
    rep = Object.assign({}, { title: `'${chart.title}'` });

    // description
    let description = chart.description;
    if (description) {
      rep = Object.assign(rep, { description: `'${description}'` });
    }

    // model
    rep = Object.assign(rep, { model: mconfig.model_id });

    // select
    rep = Object.assign(rep, { select: mconfig.select });

    // sorts
    let sorts = mconfig.sorts;
    if (sorts) {
      rep = Object.assign(rep, { sorts: `'${sorts}'` });
    }

    // timezone
    let timezone = mconfig.timezone;
    if (timezone && timezone !== 'UTC') {
      rep = Object.assign(rep, { timezone: timezone });
    }

    // limit
    let limit = mconfig.limit;
    if (limit && limit !== 500) {
      rep = Object.assign(rep, { limit: limit });
    }

    // default_filters
    let filters = mconfig.filters;
    if (filters && filters.length > 0) {
      let defaultFilters: any = {};

      filters.forEach((x: api.Filter) => {
        let bricks: string[] = [];

        x.fractions.forEach(z => bricks.push(`'${z.brick}'`));

        defaultFilters = Object.assign(defaultFilters, {
          [x.field_id]: bricks
        });
      });

      rep = Object.assign(rep, { default_filters: defaultFilters });
    }

    // type
    rep = Object.assign(rep, { type: `'${chart.type}'` });

    // data
    let data = this.prepareData(chart);

    if (Object.keys(data).length > 0) {
      rep = Object.assign(rep, { data: data });
    }

    // axis
    let axis = this.prepareAxis(chart);

    if (Object.keys(axis).length > 0) {
      rep = Object.assign(rep, { axis: axis });
    }

    // options
    let options = this.prepareOptions(chart);

    if (Object.keys(options).length > 0) {
      rep = Object.assign(rep, { options: options });
    }

    // tile
    let tile = this.prepareTile(chart);

    if (Object.keys(tile).length > 0) {
      rep = Object.assign(rep, { tile: tile });
    }
    return rep;
  }

  prepareData(chart: api.Chart) {
    let data = {};

    // x_field
    let xField = chart.x_field;

    if (xField && constants.xFieldChartTypes.indexOf(chart.type) !== -1) {
      data = Object.assign(data, { x_field: xField });
    }

    // y_field
    let yField = chart.y_field;

    if (yField && constants.yFieldChartTypes.indexOf(chart.type) !== -1) {
      data = Object.assign(data, { y_field: yField });
    }

    // y_fields
    let yFields = chart.y_fields;

    if (yFields && constants.yFieldsChartTypes.indexOf(chart.type) !== -1) {
      data = Object.assign(data, { y_fields: yFields });
    }

    // hide_columns
    let hideColumns = chart.hide_columns;

    if (
      hideColumns &&
      hideColumns.length > 0 &&
      constants.hideColumnsChartTypes.indexOf(chart.type) !== -1
    ) {
      data = Object.assign(data, { hide_columns: hideColumns });
    }

    // multi_field
    let multiField = chart.multi_field;

    if (
      multiField &&
      constants.multiFieldChartTypes.indexOf(chart.type) !== -1
    ) {
      data = Object.assign(data, { multi_field: multiField });
    }

    // value_field
    let valueField = chart.value_field;

    if (
      valueField &&
      constants.valueFieldChartTypes.indexOf(chart.type) !== -1
    ) {
      data = Object.assign(data, { value_field: valueField });
    }

    // previous_value_field
    let previousValueField = chart.previous_value_field;

    if (
      previousValueField &&
      constants.previousValueFieldChartTypes.indexOf(chart.type) !== -1
    ) {
      data = Object.assign(data, { previous_value_field: previousValueField });
    }

    return data;
  }

  prepareAxis(chart: api.Chart) {
    let axis = {};

    // x_axis
    let xAxis = chart.x_axis;
    if (
      xAxis === false &&
      constants.xAxisChartTypes.indexOf(chart.type) !== -1
    ) {
      axis = Object.assign(axis, { x_axis: xAxis });
    }

    // show_x_axis_label
    let showXAxisLabel = chart.show_x_axis_label;
    if (
      showXAxisLabel === true &&
      constants.showXAxisLabelChartTypes.indexOf(chart.type) !== -1
    ) {
      axis = Object.assign(axis, { show_x_axis_label: showXAxisLabel });
    }

    // x_axis_label
    let xAxisLabel = chart.x_axis_label;
    if (
      xAxisLabel &&
      xAxisLabel !== '' &&
      xAxisLabel !== 'x axis label' &&
      constants.xAxisLabelChartTypes.indexOf(chart.type) !== -1
    ) {
      axis = Object.assign(axis, { x_axis_label: `'${xAxisLabel}'` });
    }

    // y_axis
    let yAxis = chart.y_axis;
    if (
      yAxis === false &&
      constants.yAxisChartTypes.indexOf(chart.type) !== -1
    ) {
      axis = Object.assign(axis, { y_axis: yAxis });
    }

    // show_y_axis_label
    let showYAxisLabel = chart.show_y_axis_label;
    if (
      showYAxisLabel === true &&
      constants.showYAxisLabelChartTypes.indexOf(chart.type) !== -1
    ) {
      axis = Object.assign(axis, { show_y_axis_label: showYAxisLabel });
    }

    // y_axis_label
    let yAxisLabel = chart.y_axis_label;
    if (
      yAxisLabel &&
      yAxisLabel !== '' &&
      yAxisLabel !== 'y axis label' &&
      constants.yAxisLabelChartTypes.indexOf(chart.type) !== -1
    ) {
      axis = Object.assign(axis, { y_axis_label: `'${yAxisLabel}'` });
    }

    // show_axis
    let showAxis = chart.show_axis;
    if (
      showAxis === false &&
      constants.showAxisChartTypes.indexOf(chart.type) !== -1
    ) {
      axis = Object.assign(axis, { show_axis: showAxis });
    }

    return axis;
  }

  prepareOptions(chart: api.Chart) {
    let options = {};

    // animations
    let animations = chart.animations;
    if (
      animations === true &&
      constants.animationsChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { animations: animations });
    }

    // gradient
    let gradient = chart.gradient;
    if (
      gradient === true &&
      constants.gradientChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { gradient: gradient });
    }

    // legend
    let legend = chart.legend;
    if (
      legend === true &&
      constants.legendChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { legend: legend });
    }

    // legend_title
    let legendTitle = chart.legend_title;
    if (
      legendTitle &&
      legendTitle !== '' &&
      legendTitle !== 'Legend' &&
      constants.legendTitleChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { legend_title: `'${legendTitle}'` });
    }

    // tooltip_disabled
    let tooltipDisabled = chart.tooltip_disabled;
    if (
      tooltipDisabled === true &&
      constants.tooltipDisabledChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { tooltip_disabled: tooltipDisabled });
    }

    // round_edges
    let roundEdges = chart.round_edges;
    if (
      roundEdges === false &&
      constants.roundEdgesChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { round_edges: roundEdges });
    }

    // round_domains
    let roundDomains = chart.round_domains;
    if (
      roundDomains === true &&
      constants.roundDomainsChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { round_domains: roundDomains });
    }

    // show_grid_lines
    let showGridLines = chart.show_grid_lines;
    if (
      showGridLines === false &&
      constants.showGridLinesChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { show_grid_lines: showGridLines });
    }

    // timeline
    let timeline = chart.timeline;
    if (
      timeline === true &&
      constants.timelineChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { timeline: timeline });
    }

    // interpolation
    let interpolation = chart.interpolation;
    if (
      interpolation &&
      interpolation !== api.ChartInterpolationEnum.Linear &&
      constants.interpolationChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { interpolation: `'${interpolation}'` });
    }

    // auto_scale
    let autoScale = chart.auto_scale;
    if (
      autoScale === true &&
      constants.autoScaleChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { auto_scale: autoScale });
    }

    // doughnut
    let doughnut = chart.doughnut;
    if (
      doughnut === true &&
      constants.doughnutChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { doughnut: doughnut });
    }

    // explode_slices
    let explodeSlices = chart.explode_slices;
    if (
      explodeSlices === true &&
      constants.explodeSlicesChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { explode_slices: explodeSlices });
    }

    // labels
    let labels = chart.labels;
    if (
      labels === true &&
      constants.labelsChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { labels: labels });
    }

    // color_scheme
    let colorScheme = chart.color_scheme;
    if (
      colorScheme &&
      colorScheme !== api.ChartColorSchemeEnum.Cool &&
      constants.colorSchemeChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { color_scheme: `'${colorScheme}'` });
    }

    // scheme_type
    let schemeType = chart.scheme_type;
    if (
      schemeType &&
      schemeType !== api.ChartSchemeTypeEnum.Ordinal &&
      constants.schemeTypeChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { scheme_type: `'${schemeType}'` });
    }

    // page_size
    let pageSize = chart.page_size;
    if (
      pageSize &&
      pageSize !== 500 &&
      constants.pageSizeChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { page_size: pageSize });
    }

    // arc_width
    let arcWidth = chart.arc_width;
    if (
      arcWidth &&
      arcWidth !== 0.25 &&
      constants.arcWidthChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { arc_width: arcWidth });
    }

    // bar_padding
    let barPadding = chart.bar_padding;
    if (
      barPadding &&
      barPadding !== 8 &&
      constants.barPaddingChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { bar_padding: barPadding });
    }

    // group_padding
    let groupPadding = chart.group_padding;
    if (
      groupPadding &&
      groupPadding !== 16 &&
      constants.groupPaddingChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { group_padding: groupPadding });
    }

    // inner_padding
    let innerPadding = chart.inner_padding;
    if (
      innerPadding &&
      innerPadding !== 8 &&
      constants.innerPaddingChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { inner_padding: innerPadding });
    }

    // range_fill_opacity
    let rangeFillOpacity = chart.range_fill_opacity;
    if (
      rangeFillOpacity &&
      rangeFillOpacity !== 0.15 &&
      constants.rangeFillOpacityChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, {
        range_fill_opacity: rangeFillOpacity
      });
    }

    // angle_span
    let angleSpan = chart.angle_span;
    if (
      angleSpan &&
      angleSpan !== 240 &&
      constants.angleSpanChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { angle_span: angleSpan });
    }

    // start_angle
    let startAngle = chart.start_angle;
    if (
      startAngle &&
      startAngle !== -120 &&
      constants.startAngleChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { start_angle: startAngle });
    }

    // big_segments
    let bigSegments = chart.big_segments;
    if (
      bigSegments &&
      bigSegments !== 10 &&
      constants.bigSegmentsChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { big_segments: bigSegments });
    }

    // small_segments
    let smallSegments = chart.small_segments;
    if (
      smallSegments &&
      smallSegments !== 5 &&
      constants.smallSegmentsChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { small_segments: smallSegments });
    }

    // min
    let min = chart.min;
    if (
      min &&
      min !== 0 &&
      constants.minChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { min: min });
    }

    // max
    let max = chart.max;
    if (
      max &&
      max !== 100 &&
      constants.maxChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { max: max });
    }

    // units
    let units = chart.units;
    if (units && constants.unitsChartTypes.indexOf(chart.type) !== -1) {
      options = Object.assign(options, { units: `'${units}'` });
    }

    // y_scale_min
    let yScaleMin = chart.y_scale_min;
    if (
      typeof yScaleMin !== 'undefined' &&
      yScaleMin !== null &&
      constants.yScaleMinChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { y_scale_min: yScaleMin });
    }

    // y_scale_max
    let yScaleMax = chart.y_scale_max;
    if (
      typeof yScaleMax !== 'undefined' &&
      yScaleMax !== null &&
      constants.yScaleMaxChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { y_scale_max: yScaleMax });
    }

    // x_scale_max
    let xScaleMax = chart.x_scale_max;
    if (
      typeof xScaleMax !== 'undefined' &&
      xScaleMax !== null &&
      constants.xScaleMaxChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { x_scale_max: xScaleMax });
    }

    // band_color
    let bandColor = chart.band_color;
    if (bandColor && constants.bandColorChartTypes.indexOf(chart.type) !== -1) {
      options = Object.assign(options, { band_color: `'${bandColor}'` });
    }

    // card_color
    let cardColor = chart.card_color;
    if (cardColor && constants.cardColorChartTypes.indexOf(chart.type) !== -1) {
      options = Object.assign(options, { card_color: `'${cardColor}'` });
    }

    // text_color
    let textColor = chart.text_color;
    if (textColor && constants.textColorChartTypes.indexOf(chart.type) !== -1) {
      options = Object.assign(options, { text_color: `'${textColor}'` });
    }

    // empty_color
    let emptyColor = chart.empty_color;
    if (
      emptyColor &&
      emptyColor !== 'rgba(0, 0, 0, 0)' &&
      constants.emptyColorChartTypes.indexOf(chart.type) !== -1
    ) {
      options = Object.assign(options, { empty_color: `'${emptyColor}'` });
    }

    return options;
  }

  prepareTile(chart: api.Chart) {
    let tile = {};

    // tile_width
    let tileWidth = chart.tile_width;
    if (tileWidth && tileWidth !== api.ChartTileWidthEnum._6) {
      tile = Object.assign(tile, { tile_width: `'${tileWidth}'` });
    }

    // tile_height
    let tileHeight = chart.tile_height;
    if (tileHeight && tileHeight !== api.ChartTileHeightEnum._500) {
      tile = Object.assign(tile, { tile_height: `'${tileHeight}'` });
    }

    // view_size
    let viewSize = chart.view_size;
    if (viewSize && viewSize !== api.ChartViewSizeEnum.Auto) {
      tile = Object.assign(tile, { view_size: `'${viewSize}'` });
    }

    // view_width
    let viewWidth = chart.view_width;
    if (
      viewWidth &&
      viewSize !== api.ChartViewSizeEnum.Auto && // viewSize
      viewWidth !== 600
    ) {
      tile = Object.assign(tile, { view_width: viewWidth });
    }

    // view_height
    let viewHeight = chart.view_height;
    if (
      viewHeight &&
      viewSize !== api.ChartViewSizeEnum.Auto && // viewSize
      viewHeight !== 200
    ) {
      tile = Object.assign(tile, { view_height: viewHeight });
    }

    return tile;
  }
}
