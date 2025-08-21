import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import { isDefined } from '~common/functions/is-defined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { ChartQuery } from '../queries/chart.query';
import { ModelQuery, ModelState } from '../queries/model.query';
import { StructQuery, StructState } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
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

  mconfig: MconfigX;

  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.mconfig = x.tiles[0].mconfig;
    })
  );

  constructor(
    private userQuery: UserQuery,
    private structQuery: StructQuery,
    private modelQuery: ModelQuery,
    private uiQuery: UiQuery,
    private chartQuery: ChartQuery
  ) {
    this.user$.subscribe();
    this.struct$.subscribe();
    this.model$.subscribe();
    this.chart$.subscribe();
  }

  makeMconfig(): MconfigX {
    let newMconfigId = makeId();
    let newQueryId = makeId();

    let emptyMconfig: MconfigX = {
      structId: this.model.structId,
      mconfigId: newMconfigId,
      queryId: newQueryId,
      modelId: this.model.modelId,
      modelType: this.model.type,
      // isStoreModel: this.model.isStoreModel,
      dateRangeIncludesRightSide: this.model.dateRangeIncludesRightSide,
      storePart: undefined,
      modelLabel: this.model.label,
      modelFilePath: this.model.filePath,
      malloyQuery: undefined,
      compiledQuery: undefined,
      select: [],
      // unsafeSelect: [],
      // warnSelect: [],
      // joinAggregations: [],
      sortings: [],
      fields: [],
      sorts: null,
      timezone: this.uiQuery.getValue().timezone,
      limit: 500,
      filters: [],
      extendedFilters: [],
      chart: makeCopy(DEFAULT_CHART),
      temp: true,
      serverTs: 1
    };

    let mconfigCopy = makeCopy(this.mconfig);

    return isDefined(this.mconfig.structId)
      ? Object.assign(mconfigCopy, <MconfigX>{
          mconfigId: newMconfigId,
          queryId: newQueryId,
          temp: true,
          serverTs: 1
        })
      : emptyMconfig;
  }
}
