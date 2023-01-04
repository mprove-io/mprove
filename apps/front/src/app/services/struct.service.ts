import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { ModelQuery, ModelState } from '../queries/model.query';
import { MqQuery } from '../queries/mq.query';
import { StructQuery, StructState } from '../queries/struct.query';
import { UserQuery, UserState } from '../queries/user.query';

@Injectable({ providedIn: 'root' })
export class StructService {
  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
    })
  );

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
    })
  );

  mconfig: common.MconfigX;
  mconfig$ = this.mqQuery.mconfig$.pipe(
    tap(x => {
      this.mconfig = x;
    })
  );

  constructor(
    private userQuery: UserQuery,
    public structQuery: StructQuery,
    private modelQuery: ModelQuery,
    private mqQuery: MqQuery
  ) {
    this.user$.subscribe();
    this.struct$.subscribe();
    this.model$.subscribe();
    this.mconfig$.subscribe();
  }

  makeMconfig(): common.MconfigX {
    let newMconfigId = common.makeId();
    let newQueryId = common.makeId();

    let emptyMconfig: common.MconfigX = {
      structId: this.model.structId,
      mconfigId: newMconfigId,
      queryId: newQueryId,
      modelId: this.model.modelId,
      modelLabel: this.model.label,
      select: [],
      sortings: [],
      fields: [],
      sorts: null,
      timezone:
        this.struct.allowTimezones === true &&
        this.user.timezone !== common.USE_PROJECT_TIMEZONE_VALUE
          ? this.user.timezone
          : this.struct.defaultTimezone,
      limit: 500,
      filters: [],
      extendedFilters: [],
      chart: {
        isValid: true,
        type: common.CHART_DEFAULT_TYPE,
        title: common.CHART_DEFAULT_TITLE,

        xField: null,
        yField: null,
        yFields: [],
        hideColumns: [],
        multiField: null,
        valueField: null,
        previousValueField: null,

        interpolation: common.CHART_DEFAULT_INTERPOLATION,
        colorScheme: common.CHART_DEFAULT_COLOR_SCHEME,
        schemeType: common.CHART_DEFAULT_SCHEME_TYPE,

        cardColor: common.CHART_DEFAULT_CARD_COLOR,
        emptyColor: common.CHART_DEFAULT_EMPTY_COLOR,
        bandColor: common.CHART_DEFAULT_BAND_COLOR,
        textColor: common.CHART_DEFAULT_TEXT_COLOR,

        xAxisLabel: common.CHART_DEFAULT_X_AXIS_LABEL,
        yAxisLabel: common.CHART_DEFAULT_Y_AXIS_LABEL,
        legendTitle: common.CHART_DEFAULT_LEGEND_TITLE,
        units: common.CHART_DEFAULT_UNITS,

        pageSize: common.CHART_DEFAULT_PAGE_SIZE,
        arcWidth: common.CHART_DEFAULT_ARC_WIDTH,
        barPadding: common.CHART_DEFAULT_BAR_PADDING,
        groupPadding: common.CHART_DEFAULT_GROUP_PADDING,
        innerPadding: common.CHART_DEFAULT_INNER_PADDING,
        rangeFillOpacity: common.CHART_DEFAULT_RANGE_FILL_OPACITY,
        angleSpan: common.CHART_DEFAULT_ANGLE_SPAN,
        startAngle: common.CHART_DEFAULT_START_ANGLE,
        bigSegments: common.CHART_DEFAULT_BIG_SEGMENTS,
        smallSegments: common.CHART_DEFAULT_SMALL_SEGMENTS,
        min: common.CHART_DEFAULT_MIN,
        max: common.CHART_DEFAULT_MAX,
        yScaleMin: common.CHART_DEFAULT_Y_SCALE_MIN,
        yScaleMax: common.CHART_DEFAULT_Y_SCALE_MAX,
        xScaleMax: common.CHART_DEFAULT_X_SCALE_MAX,

        timeline: common.CHART_DEFAULT_TIMELINE,
        showAxis: common.CHART_DEFAULT_SHOW_AXIS,

        labels: common.CHART_DEFAULT_LABELS,
        showDataLabel: common.CHART_DEFAULT_SHOW_DATA_LABEL,
        format: common.CHART_DEFAULT_FORMAT,
        autoScale: common.CHART_DEFAULT_AUTO_SCALE,
        legend: common.CHART_DEFAULT_LEGEND,
        doughnut: common.CHART_DEFAULT_DOUGHNUT,
        explodeSlices: common.CHART_DEFAULT_EXPLODE_SLICES,
        xAxis: common.CHART_DEFAULT_X_AXIS,
        yAxis: common.CHART_DEFAULT_Y_AXIS,
        showXAxisLabel: common.CHART_DEFAULT_SHOW_X_AXIS_LABEL,
        showYAxisLabel: common.CHART_DEFAULT_SHOW_Y_AXIS_LABEL,
        roundDomains: common.CHART_DEFAULT_ROUND_DOMAINS,
        showGridLines: common.CHART_DEFAULT_SHOW_GRID_LINES,
        roundEdges: common.CHART_DEFAULT_ROUND_EDGES,
        tooltipDisabled: common.CHART_DEFAULT_TOOLTIP_DISABLED,
        gradient: common.CHART_DEFAULT_GRADIENT,
        animations: common.CHART_DEFAULT_ANIMATIONS,

        formatNumberDataLabel: common.CHART_DEFAULT_FORMAT_NUMBER_DATA_LABEL,
        formatNumberValue: common.CHART_DEFAULT_FORMAT_NUMBER_VALUE,
        formatNumberAxisTick: common.CHART_DEFAULT_FORMAT_AXIS_TICK,
        formatNumberYAxisTick: common.CHART_DEFAULT_FORMAT_Y_AXIS_TICK,
        formatNumberXAxisTick: common.CHART_DEFAULT_FORMAT_X_AXIS_TICK
      },
      temp: true,
      serverTs: 1
    };

    let mconfigCopy = common.makeCopy(this.mconfig);

    return common.isDefined(this.mconfig.structId)
      ? Object.assign(mconfigCopy, <common.MconfigX>{
          mconfigId: newMconfigId,
          queryId: newQueryId,
          temp: true,
          serverTs: 1
        })
      : emptyMconfig;
  }
}
