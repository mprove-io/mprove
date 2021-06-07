import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { common } from '~front/barrels/common';

export class QueryState extends common.Query {}

@Injectable({ providedIn: 'root' })
@StoreConfig({
  name: 'query',
  resettable: true
})
export class QueryStore extends Store<QueryState> {
  constructor() {
    super(<QueryState>{
      projectId: undefined,
      connectionId: undefined,
      connectionType: undefined,
      queryId: undefined,
      sql: undefined,
      status: common.QueryStatusEnum.New,
      data: [],
      lastRunBy: undefined,
      lastRunTs: 1,
      lastCancelTs: 1,
      lastCompleteTs: 1,
      lastCompleteDuration: undefined,
      lastErrorMessage: undefined,
      lastErrorTs: 1,
      postgresQueryJobId: undefined,
      bigqueryQueryJobId: undefined,
      bigqueryConsecutiveErrorsGetJob: undefined,
      bigqueryConsecutiveErrorsGetResults: undefined,
      serverTs: 1
    });
  }
}
