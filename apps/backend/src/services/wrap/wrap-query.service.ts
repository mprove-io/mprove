import { Injectable } from '@nestjs/common';
import { QueryEnt } from '~backend/drizzle/postgres/schema/queries';
import {
  QueryLt,
  QuerySt,
  QueryTab
} from '~backend/drizzle/postgres/tabs/query-tab';
import { StoreMethodEnum } from '~common/enums/store-method.enum';
import { isDefined } from '~common/functions/is-defined';
import { Query } from '~common/interfaces/blockml/query';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapQueryService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  tabToApi(item: { query: QueryTab }): Query {
    let { query } = item;

    let apiQuery: Query = {
      projectId: query.projectId,
      envId: query.envId,
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      sql: query.st.sql,
      apiMethod: query.st.apiMethod as StoreMethodEnum,
      apiUrl: query.st.apiUrl,
      apiBody: query.st.apiBody,
      status: query.status,
      lastRunBy: query.lastRunBy,
      lastRunTs: query.lastRunTs,
      lastCancelTs: query.lastCancelTs,
      lastCompleteTs: query.lastCompleteTs,
      lastCompleteDuration: query.lastCompleteDuration,
      lastErrorMessage: query.st.lastErrorMessage,
      lastErrorTs: query.lastErrorTs,
      data: query.lt.data,
      queryJobId: query.queryJobId,
      bigqueryQueryJobId: query.bigqueryQueryJobId,
      bigqueryConsecutiveErrorsGetJob: query.bigqueryConsecutiveErrorsGetJob,
      bigqueryConsecutiveErrorsGetResults:
        query.bigqueryConsecutiveErrorsGetResults,
      serverTs: query.serverTs
    };

    return apiQuery;
  }

  apiToTab(item: { query: Query }): QueryTab {
    let { query } = item;

    let querySt: QuerySt = {
      sql: query.sql,
      apiMethod: query.apiMethod,
      apiUrl: query.apiUrl,
      apiBody: query.apiBody,
      lastErrorMessage: query.lastErrorMessage
    };

    let queryLt: QueryLt = {
      data: query.data
    };

    let queryTab: QueryTab = {
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
      st: querySt,
      lt: queryLt,
      apiUrlHash: this.hashService.makeHash(query.apiUrl),
      serverTs: query.serverTs
    };

    return queryTab;
  }

  tabToEnt(query: QueryTab): QueryEnt {
    let queryEnt: QueryEnt = {
      ...query,
      st: this.tabService.encrypt({ data: query.st }),
      lt: this.tabService.encrypt({ data: query.lt })
    };

    return queryEnt;
  }

  entToTab(query: QueryEnt): QueryTab {
    let queryTab: QueryTab = {
      ...query,
      st: this.tabService.decrypt<QuerySt>({
        encryptedString: query.st
      }),
      lt: this.tabService.decrypt<QueryLt>({
        encryptedString: query.lt
      })
    };

    return queryTab;
  }
}
