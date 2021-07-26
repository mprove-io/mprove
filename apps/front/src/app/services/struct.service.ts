import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { ModelQuery } from '../queries/model.query';
import { MqQuery } from '../queries/mq.query';
import { StructQuery } from '../queries/struct.query';
import { UserQuery } from '../queries/user.query';
import { ModelState } from '../stores/model.store';
import { StructState } from '../stores/struct.store';
import { UserState } from '../stores/user.store';

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

  mconfig: common.Mconfig;
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

  makeMconfig(): common.Mconfig {
    let newMconfigId = common.makeId();
    let newQueryId = common.makeId();

    let emptyMconfig: common.Mconfig = {
      structId: this.struct.structId,
      mconfigId: newMconfigId,
      queryId: newQueryId,
      modelId: this.model.modelId,
      select: [],
      sortings: [],
      sorts: null,
      timezone:
        this.struct.allowTimezones === false
          ? this.struct.defaultTimezone
          : this.user.timezone === common.USE_PROJECT_TIMEZONE_VALUE
          ? this.struct.defaultTimezone
          : this.user.timezone,
      limit: 500,
      filters: [],
      chart: {
        isValid: true,
        type: common.ChartTypeEnum.BarVertical,
        title: 'Title',

        xField: null,
        yField: null,
        yFields: [],
        hideColumns: [],
        multiField: null,
        valueField: null,
        previousValueField: null,

        interpolation: common.ChartInterpolationEnum.Linear,
        colorScheme: common.ChartColorSchemeEnum.Cool,
        schemeType: common.ChartSchemeTypeEnum.Ordinal,

        bandColor: null,
        cardColor: null,
        textColor: null,
        emptyColor: null,

        xAxisLabel: 'X axis label',
        yAxisLabel: 'Y axis label',
        legendTitle: 'Legend title',
        units: 'Units',

        pageSize: 5,
        arcWidth: 0.25,
        barPadding: 8,
        groupPadding: 16,
        innerPadding: 8,
        rangeFillOpacity: 0.15,
        angleSpan: 240,
        startAngle: -120,
        bigSegments: 10,
        smallSegments: 5,
        min: 0,
        max: 100,
        yScaleMin: null,
        yScaleMax: null,
        xScaleMax: null,

        timeline: false,
        autoScale: true,
        doughnut: false,
        explodeSlices: false,
        labels: false,
        showAxis: true,

        xAxis: true,
        yAxis: true,
        showXAxisLabel: false,
        showYAxisLabel: false,
        legend: false,
        roundDomains: true,
        showGridLines: true,
        roundEdges: true,
        tooltipDisabled: false,
        gradient: false,
        animations: false,

        tileWidth: common.ChartTileWidthEnum._6,
        tileHeight: common.ChartTileHeightEnum._500,
        viewSize: common.ChartViewSizeEnum.Auto,
        viewWidth: 600,
        viewHeight: 200
      },
      temp: true,
      serverTs: 1
    };

    let mconfigCopy = common.makeCopy(this.mconfig);

    return common.isDefined(this.mconfig.structId)
      ? Object.assign(mconfigCopy, <common.Mconfig>{
          mconfigId: newMconfigId,
          queryId: newQueryId,
          temp: true,
          serverTs: 1
        })
      : emptyMconfig;
  }
}
