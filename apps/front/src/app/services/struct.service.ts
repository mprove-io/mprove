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
    private structQuery: StructQuery,
    private modelQuery: ModelQuery,
    private mqQuery: MqQuery
  ) {
    this.user$.subscribe();
    this.struct$.subscribe();
    this.model$.subscribe();
    this.mconfig$.subscribe();
  }

  getTimezone() {
    return this.struct.allowTimezones === true &&
      this.user.timezone !== common.USE_PROJECT_TIMEZONE_VALUE
      ? this.user.timezone
      : this.struct.defaultTimezone;
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
      unsafeSelect: [],
      warnSelect: [],
      joinAggregations: [],
      sortings: [],
      fields: [],
      sorts: null,
      timezone: this.getTimezone(),
      limit: 500,
      filters: [],
      extendedFilters: [],
      chart: common.DEFAULT_CHART,
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
