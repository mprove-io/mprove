import { BigQuery } from '@google-cloud/bigquery';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray, sql } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { QueryTab } from '~backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import {
  QueryEnt,
  queriesTable
} from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { StoreMethodEnum } from '~common/enums/store-method.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { Query } from '~common/interfaces/blockml/query';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';
import { EnvsService } from './envs.service';

let retry = require('async-retry');

@Injectable()
export class QueriesService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  tabToApi(item: { query: QueryTab }): Query {
    let { query } = item;

    let apiQuery: Query = {
      projectId: query.projectId,
      envId: query.envId,
      connectionId: query.connectionId,
      connectionType: query.connectionType,
      queryId: query.queryId,
      reportId: query.reportId,
      reportStructId: query.reportStructId,
      sql: query.sql,
      apiMethod: query.apiMethod as StoreMethodEnum,
      apiUrl: query.apiUrl,
      apiBody: query.apiBody,
      status: query.status,
      lastRunBy: query.lastRunBy,
      lastRunTs: query.lastRunTs,
      lastCancelTs: query.lastCancelTs,
      lastCompleteTs: query.lastCompleteTs,
      lastCompleteDuration: query.lastCompleteDuration,
      lastErrorMessage: query.lastErrorMessage,
      lastErrorTs: query.lastErrorTs,
      data: query.data,
      queryJobId: query.queryJobId,
      bigqueryQueryJobId: query.bigqueryQueryJobId,
      bigqueryConsecutiveErrorsGetJob: query.bigqueryConsecutiveErrorsGetJob,
      bigqueryConsecutiveErrorsGetResults:
        query.bigqueryConsecutiveErrorsGetResults,
      serverTs: query.serverTs
    };

    return apiQuery;
  }

  apiToTab(item: { apiQuery: Query }): QueryTab {
    let { apiQuery } = item;

    if (isUndefined(apiQuery)) {
      return;
    }

    let query: QueryTab = {
      projectId: apiQuery.projectId,
      envId: apiQuery.envId,
      connectionId: apiQuery.connectionId,
      connectionType: apiQuery.connectionType,
      queryId: apiQuery.queryId,
      reportId: apiQuery.reportId,
      reportStructId: apiQuery.reportStructId,
      status: apiQuery.status,
      lastRunBy: apiQuery.lastRunBy,
      lastRunTs: apiQuery.lastRunTs,
      lastCancelTs: apiQuery.lastCancelTs,
      lastCompleteTs: apiQuery.lastCompleteTs,
      lastCompleteDuration: apiQuery.lastCompleteDuration,
      lastErrorTs: apiQuery.lastErrorTs,
      queryJobId: undefined, // null
      bigqueryQueryJobId: undefined, // null
      bigqueryConsecutiveErrorsGetJob: isDefined(
        apiQuery.bigqueryConsecutiveErrorsGetJob
      )
        ? apiQuery.bigqueryConsecutiveErrorsGetJob
        : 0,
      bigqueryConsecutiveErrorsGetResults: isDefined(
        apiQuery.bigqueryConsecutiveErrorsGetResults
      )
        ? apiQuery.bigqueryConsecutiveErrorsGetResults
        : 0,
      sql: apiQuery.sql,
      apiMethod: apiQuery.apiMethod,
      apiUrl: apiQuery.apiUrl,
      apiBody: apiQuery.apiBody,
      lastErrorMessage: apiQuery.lastErrorMessage,
      data: apiQuery.data,
      apiUrlHash: undefined, // tab-to-ent
      keyTag: undefined,
      serverTs: apiQuery.serverTs
    };

    return query;
  }

  async getQueryCheckExistsSkipData(item: {
    queryId: string;
    projectId: string;
  }) {
    let { queryId: queryId, projectId: projectId } = item;

    let queries = await this.db.drizzle
      .select({
        keyTag: queriesTable.keyTag,
        projectId: queriesTable.projectId,
        envId: queriesTable.envId,
        connectionId: queriesTable.connectionId,
        connectionType: queriesTable.connectionType,
        queryId: queriesTable.queryId,
        reportId: queriesTable.reportId,
        reportStructId: queriesTable.reportStructId,
        status: queriesTable.status,
        lastRunBy: queriesTable.lastRunBy,
        lastRunTs: queriesTable.lastRunTs,
        lastCancelTs: queriesTable.lastCancelTs,
        lastCompleteTs: queriesTable.lastCompleteTs,
        lastCompleteDuration: queriesTable.lastCompleteDuration,
        lastErrorTs: queriesTable.lastErrorTs,
        queryJobId: queriesTable.queryJobId,
        bigqueryQueryJobId: queriesTable.bigqueryQueryJobId,
        bigqueryConsecutiveErrorsGetJob:
          queriesTable.bigqueryConsecutiveErrorsGetJob,
        bigqueryConsecutiveErrorsGetResults:
          queriesTable.bigqueryConsecutiveErrorsGetResults,
        st: queriesTable.st,
        // lt: {},
        serverTs: queriesTable.serverTs
      })
      .from(queriesTable)
      .where(
        and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.projectId, projectId)
        )
      )
      .then(xs => xs.map(x => this.tabService.queryEntToTab(x as QueryEnt)));

    let query = queries.length < 0 ? undefined : queries[0];

    if (isUndefined(query)) {
      throw new ServerError({
        message: ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }

  async getQueryCheckExists(item: { queryId: string; projectId: string }) {
    let { queryId, projectId } = item;

    let query = await this.db.drizzle.query.queriesTable
      .findFirst({
        where: and(
          eq(queriesTable.queryId, queryId),
          eq(queriesTable.projectId, projectId)
        )
      })
      .then(x => this.tabService.queryEntToTab(x));

    if (isUndefined(query)) {
      throw new ServerError({
        message: ErEnum.BACKEND_QUERY_DOES_NOT_EXIST
      });
    }

    return query;
  }

  async getQueriesCheckExistSkipSqlData(item: {
    queryIds: string[];
    projectId: string;
  }) {
    let { queryIds, projectId } = item;

    let queries = await this.db.drizzle
      .select({
        keyTag: queriesTable.keyTag,
        projectId: queriesTable.projectId,
        envId: queriesTable.envId,
        connectionId: queriesTable.connectionId,
        connectionType: queriesTable.connectionType,
        queryId: queriesTable.queryId,
        reportId: queriesTable.reportId,
        reportStructId: queriesTable.reportStructId,
        status: queriesTable.status,
        lastRunBy: queriesTable.lastRunBy,
        lastRunTs: queriesTable.lastRunTs,
        lastCancelTs: queriesTable.lastCancelTs,
        lastCompleteTs: queriesTable.lastCompleteTs,
        lastCompleteDuration: queriesTable.lastCompleteDuration,
        lastErrorTs: queriesTable.lastErrorTs,
        queryJobId: queriesTable.queryJobId,
        bigqueryQueryJobId: queriesTable.bigqueryQueryJobId,
        bigqueryConsecutiveErrorsGetJob:
          queriesTable.bigqueryConsecutiveErrorsGetJob,
        bigqueryConsecutiveErrorsGetResults:
          queriesTable.bigqueryConsecutiveErrorsGetResults,
        st: queriesTable.st,
        // lt: {},
        serverTs: queriesTable.serverTs
      })
      .from(queriesTable)
      .where(
        and(
          inArray(queriesTable.queryId, queryIds),
          eq(queriesTable.projectId, projectId)
        )
      )
      .then(xs => xs.map(x => this.tabService.queryEntToTab(x as QueryEnt)));

    let notFoundQueryIds: string[] = [];

    queryIds.forEach(x => {
      if (queries.map(query => query.queryId).indexOf(x) < -1) {
        notFoundQueryIds.push(x);
      }
    });

    if (notFoundQueryIds.length > 0) {
      throw new ServerError({
        message: ErEnum.BACKEND_QUERIES_DO_NOT_EXIST,
        displayData: {
          notFoundQueryIds: notFoundQueryIds
        }
      });
    }

    return queries;
  }

  async getQueriesCheckExist(item: {
    queryIds: string[];
    projectId: string;
  }) {
    let { queryIds, projectId } = item;

    let queries = await this.db.drizzle.query.queriesTable
      .findMany({
        where: and(
          inArray(queriesTable.queryId, queryIds),
          eq(queriesTable.projectId, projectId)
        )
      })
      .then(xs => xs.map(x => this.tabService.queryEntToTab(x)));

    let notFoundQueryIds: string[] = [];

    queryIds.forEach(x => {
      if (queries.map(query => query.queryId).indexOf(x) < -1) {
        notFoundQueryIds.push(x);
      }
    });

    if (notFoundQueryIds.length > 0) {
      throw new ServerError({
        message: ErEnum.BACKEND_QUERIES_DO_NOT_EXIST,
        displayData: {
          notFoundQueryIds: notFoundQueryIds
        }
      });
    }

    return queries;
  }

  async removeQueries() {
    let rawData = await this.db.drizzle.execute(sql`
SELECT
  q.query_id
FROM queries as q
LEFT JOIN mconfigs as m ON q.query_id=m.query_id
WHERE m.mconfig_id is NULL AND q.report_id is NULL AND to_timestamp(q.server_ts/1000) < (NOW() - INTERVAL '7 days')
`);

    let queryIds: string[] = rawData.rows.map((x: any) => x.query_id) || [];

    if (queryIds.length > 0) {
      await this.db.drizzle
        .delete(queriesTable)
        .where(inArray(queriesTable.queryId, queryIds));
    }
  }

  async checkBigqueryRunningQueries() {
    let queries = await this.db.drizzle.query.queriesTable
      .findMany({
        where: and(
          eq(queriesTable.status, QueryStatusEnum.Running),
          eq(queriesTable.connectionType, ConnectionTypeEnum.BigQuery)
        )
      })
      .then(xs => xs.map(x => this.tabService.queryEntToTab(x)));

    await asyncPool(8, queries, async (query: QueryTab) => {
      try {
        let apiEnvs = await this.envsService.getApiEnvs({
          projectId: query.projectId
        });

        let apiEnv = apiEnvs.find(x => x.envId === query.envId);

        let connection = await this.db.drizzle.query.connectionsTable
          .findFirst({
            where: and(
              eq(connectionsTable.projectId, query.projectId),
              eq(
                connectionsTable.envId,
                apiEnv.fallbackConnectionIds.indexOf(query.connectionId) > -1
                  ? PROJECT_ENV_PROD
                  : query.envId
              ),
              eq(connectionsTable.connectionId, query.connectionId)
            )
          })
          .then(x => this.tabService.connectionEntToTab(x));

        if (isUndefined(connection)) {
          query.status = QueryStatusEnum.Error;
          query.data = [];
          query.lastErrorMessage = `Project connection not found`;
          query.lastErrorTs = makeTsNumber();

          await retry(
            async () =>
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: {
                      queries: [query]
                    }
                  })
              ),
            getRetryOption(this.cs, this.logger)
          );

          return;
        }

        let bigquery = new BigQuery({
          credentials: connection.options.bigquery.serviceAccountCredentials,
          projectId: connection.options.bigquery.googleCloudProject
        });

        let bigqueryQueryJob = bigquery.job(query.bigqueryQueryJobId);

        let itemQueryJob = await bigqueryQueryJob
          .get()
          .catch(async (e: any) => {
            if (query.bigqueryConsecutiveErrorsGetJob > 2) {
              query.status = QueryStatusEnum.Error;
              query.data = [];
              query.lastErrorMessage = `Bigquery get Job fail`;
              query.lastErrorTs = makeTsNumber();
            } else {
              query.bigqueryConsecutiveErrorsGetJob =
                query.bigqueryConsecutiveErrorsGetJob + 1;
            }

            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        queries: [query]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );

            return;
          });

        query.bigqueryConsecutiveErrorsGetJob = 0;

        await retry(
          async () =>
            await this.db.drizzle.transaction(
              async tx =>
                await this.db.packer.write({
                  tx: tx,
                  insertOrUpdate: {
                    queries: [query]
                  }
                })
            ),
          getRetryOption(this.cs, this.logger)
        );

        let queryJob = (itemQueryJob as any)[0];
        let queryJobGetResponse: any = (itemQueryJob as any)[1];

        if (queryJobGetResponse.status.state === 'DONE') {
          if (queryJobGetResponse.status.errorResult) {
            let errorResult = queryJobGetResponse.status.errorResult;

            query.status = QueryStatusEnum.Error;
            query.data = [];
            query.lastErrorMessage =
              `Query fail. ` +
              `Message: '${errorResult.message}'. ` +
              `Reason: '${errorResult.reason}'. ` +
              `Location: '${errorResult.location}'.`;
            query.lastErrorTs = makeTsNumber();

            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        queries: [query]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          } else {
            let queryResultsItem = await queryJob
              .getQueryResults()
              .catch(async (e: any) => {
                if (query.bigqueryConsecutiveErrorsGetResults > 2) {
                  query.status = QueryStatusEnum.Error;
                  query.data = [];
                  query.lastErrorMessage = `Bigquery get QueryResults fail`;
                  query.lastErrorTs = makeTsNumber();
                } else {
                  query.bigqueryConsecutiveErrorsGetResults =
                    query.bigqueryConsecutiveErrorsGetResults + 1;
                }

                await retry(
                  async () =>
                    await this.db.drizzle.transaction(
                      async tx =>
                        await this.db.packer.write({
                          tx: tx,
                          insertOrUpdate: {
                            queries: [query]
                          }
                        })
                    ),
                  getRetryOption(this.cs, this.logger)
                );

                return;
              });

            let newLastCompleteTs = makeTsNumber();
            let newLastCompleteDuration = Math.floor(
              (Number(newLastCompleteTs) - Number(query.lastRunTs)) / 1000
            );

            query.status = QueryStatusEnum.Completed;
            // no need for query.bigquery_consecutive_errors_get_results = 0
            // because status change to Completed
            query.data = queryResultsItem[0];
            query.lastCompleteTs = newLastCompleteTs;
            query.lastCompleteDuration = newLastCompleteDuration;

            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        queries: [query]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      }
    });
  }
}
