import { Injectable } from '@nestjs/common';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapQueryService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToApiQuery(item: { query: QueryEnt }): Query {
    let { query } = item;

    let queryTab = this.tabService.decrypt<QueryTab>({
      encryptedString: query.tab
    });

    let apiQuery: Query = {
      projectId: query.projectId,
      envId: query.envId,
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      sql: queryTab.sql,
      apiMethod: queryTab.apiMethod as StoreMethodEnum,
      apiUrl: queryTab.apiUrl,
      apiBody: queryTab.apiBody,
      status: query.status,
      lastRunBy: query.lastRunBy,
      lastRunTs: query.lastRunTs,
      lastCancelTs: query.lastCancelTs,
      lastCompleteTs: query.lastCompleteTs,
      lastCompleteDuration: query.lastCompleteDuration,
      lastErrorMessage: queryTab.lastErrorMessage,
      lastErrorTs: query.lastErrorTs,
      data: queryTab.data,
      queryJobId: query.queryJobId,
      bigqueryQueryJobId: query.bigqueryQueryJobId,
      bigqueryConsecutiveErrorsGetJob: query.bigqueryConsecutiveErrorsGetJob,
      bigqueryConsecutiveErrorsGetResults:
        query.bigqueryConsecutiveErrorsGetResults,
      serverTs: query.serverTs
    };

    return apiQuery;
  }

  wrapToEntityQuery(item: { query: Query }): QueryEnt {
    let { query } = item;

    let queryTab: QueryTab = {
      sql: query.sql,
      apiMethod: query.apiMethod,
      apiUrl: query.apiUrl,
      apiBody: query.apiBody,
      data: query.data,
      lastErrorMessage: query.lastErrorMessage
    };

    let queryEnt: QueryEnt = {
      projectId: query.projectId,
      envId: query.envId,
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      status: query.status,
      lastRunBy: query.lastRunBy,
      lastRunTs: query.lastRunTs,
      lastCancelTs: query.lastCancelTs,
      lastCompleteTs: query.lastCompleteTs,
      lastCompleteDuration: query.lastCompleteDuration,
      lastErrorTs: query.lastErrorTs,
      queryJobId: undefined, // null
      bigqueryQueryJobId: undefined, // null
      bigqueryConsecutiveErrorsGetJob: isDefined(
        query.bigqueryConsecutiveErrorsGetJob
      )
        ? query.bigqueryConsecutiveErrorsGetJob
        : 0,
      bigqueryConsecutiveErrorsGetResults: isDefined(
        query.bigqueryConsecutiveErrorsGetResults
      )
        ? query.bigqueryConsecutiveErrorsGetResults
        : 0,
      apiUrlHash: this.hashService.makeHash(query.apiUrl),
      tab: this.tabService.encrypt({ data: queryTab }),
      serverTs: query.serverTs
    };

    return queryEnt;
  }
}
