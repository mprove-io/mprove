import { BigQuery } from '@google-cloud/bigquery';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, sql } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';
import { BackendConfig } from '#backend/config/backend-config';
import type {
  ConnectionTab,
  QueryTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import {
  type QueryEnt,
  queriesTable
} from '#backend/drizzle/postgres/schema/queries';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckBigqueryRunningQueriesError } from '#common/types/backend/function-errors/check-bigquery-running-queries-error';
import type { DbQueriesFindManyError } from '#common/types/backend/function-errors/db/queries/db-queries-find-many-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetQueriesCheckExistError } from '#common/types/backend/function-errors/get-queries-check-exist-error';
import type { GetQueriesCheckExistSkipSqlDataError } from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import type { GetQueryCheckExistsSkipDataError } from '#common/types/backend/function-errors/get-query-check-exists-skip-data-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { Env } from '#common/types/backend/parts/env';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { StoreMethod } from '#common/types/blockml/parts/store/store-method';

@Injectable()
export class QueriesService {
  constructor(
    private tabService: TabService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
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
      apiMethod: query.apiMethod as StoreMethod,
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
      queryJobId: undefined,
      bigqueryQueryJobId: undefined,
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
      sessionId: undefined,
      keyTag: undefined,
      serverTs: apiQuery.serverTs
    };

    return query;
  }

  async getQueryCheckExistsSkipData(item: {
    queryId: string;
    projectId: string;
  }): Result.ResultAsync<QueryTab, GetQueryCheckExistsSkipDataError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'queries',
        (v): Result.ResultAsync<QueryTab[], QueryEntToTabError> =>
          this.db.drizzle
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
                eq(queriesTable.queryId, v.queryId),
                eq(queriesTable.projectId, v.projectId)
              )
            )
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.queryEntToTab({
                  queryEnt: x as QueryEnt
                })
              )
            )
      ),
      Result.andThen(
        (v): Result.Result<QueryTab, GetQueryCheckExistsSkipDataError> =>
          isUndefined(v.queries[0])
            ? Result.fail({ code: 'BACKEND_QUERY_DOES_NOT_EXIST' })
            : Result.succeed(v.queries[0])
      )
    );
  }

  async getQueriesCheckExistSkipSqlData(item: {
    queryIds: string[];
    projectId: string;
  }): Result.ResultAsync<QueryTab[], GetQueriesCheckExistSkipSqlDataError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'queries',
        (v): Result.ResultAsync<QueryTab[], QueryEntToTabError> =>
          this.db.drizzle
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
                inArray(queriesTable.queryId, v.queryIds),
                eq(queriesTable.projectId, v.projectId)
              )
            )
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.queryEntToTab({
                  queryEnt: x as QueryEnt
                })
              )
            )
      ),
      Result.andThrough(v => {
        // Preserve the existing missing-ID predicate during signature migration.
        let notFoundQueryIds: string[] = v.queryIds.filter(
          queryId => v.queries.map(query => query.queryId).indexOf(queryId) < -1
        );

        return notFoundQueryIds.length > 0
          ? Result.fail({
              code: 'BACKEND_QUERIES_DO_NOT_EXIST',
              displayData: { notFoundQueryIds: notFoundQueryIds }
            })
          : Result.succeed();
      }),
      Result.map((v): QueryTab[] => v.queries)
    );
  }

  async getQueriesCheckExist(item: {
    queryIds: string[];
    projectId: string;
  }): Result.ResultAsync<QueryTab[], GetQueriesCheckExistError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'queries',
        (v): Result.ResultAsync<QueryTab[], DbQueriesFindManyError> =>
          this.db.queries.findMany({
            where: and(
              inArray(queriesTable.queryId, v.queryIds),
              eq(queriesTable.projectId, v.projectId)
            )
          })
      ),
      Result.andThrough(v => {
        // Preserve the existing missing-ID predicate during signature migration.
        let notFoundQueryIds: string[] = v.queryIds.filter(
          queryId => v.queries.map(query => query.queryId).indexOf(queryId) < -1
        );

        return notFoundQueryIds.length > 0
          ? Result.fail({
              code: 'BACKEND_QUERIES_DO_NOT_EXIST',
              displayData: { notFoundQueryIds: notFoundQueryIds }
            })
          : Result.succeed();
      }),
      Result.map((v): QueryTab[] => v.queries)
    );
  }

  async removeQueries() {
    let rawData = await this.db.drizzle.execute(sql`
SELECT
  q.query_id
FROM queries as q
WHERE q.report_id is NULL
  AND to_timestamp(q.server_ts/1000) < (NOW() - INTERVAL '7 days')
  AND q.session_id IS NULL
`);

    let queryIds: string[] = rawData.rows.map((x: any) => x.query_id) || [];

    if (queryIds.length > 0) {
      await this.db.drizzle
        .delete(queriesTable)
        .where(inArray(queriesTable.queryId, queryIds));
    }
  }

  async checkBigqueryRunningQueries(): Result.ResultAsync<
    void,
    CheckBigqueryRunningQueriesError
  > {
    let queryCollection: Result.Result<QueryTab[], DbQueriesFindManyError> =
      await this.db.queries.findMany({
        where: and(
          eq(queriesTable.status, 'Running'),
          eq(queriesTable.connectionType, 'BigQuery')
        )
      });

    if (Result.isFailure(queryCollection)) {
      return queryCollection;
    }

    let queries: QueryTab[] = queryCollection.value;

    await asyncPool(8, queries, async (query: QueryTab) => {
      try {
        let apiEnvsResult: Result.Result<Env[], GetApiEnvsError> =
          await this.envsService.getApiEnvs({
            projectId: query.projectId
          });

        if (Result.isFailure(apiEnvsResult)) {
          throw new ServerError({ message: apiEnvsResult.error.code });
        }

        let apiEnvs: Env[] = apiEnvsResult.value;

        let apiEnv: Env = apiEnvs.find(x => x.envId === query.envId);

        let connection: ConnectionTab =
          await this.db.connections.findFirstUnwrap({
            where: and(
              eq(connectionsTable.projectId, query.projectId),
              eq(
                connectionsTable.envId,
                apiEnv.fallbackConnectionIds.includes(query.connectionId)
                  ? PROJECT_ENV_PROD
                  : query.envId
              ),
              eq(connectionsTable.connectionId, query.connectionId)
            )
          });

        if (isUndefined(connection)) {
          query.status = 'Error';
          query.data = [];
          query.lastErrorMessage = `Project connection not found`;
          query.lastErrorTs = makeTsNumber();

          await this.db.writeUnwrap({
            insertOrUpdate: {
              queries: [query]
            }
          });

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
              query.status = 'Error';
              query.data = [];
              query.lastErrorMessage = `Bigquery get Job fail`;
              query.lastErrorTs = makeTsNumber();
            } else {
              query.bigqueryConsecutiveErrorsGetJob =
                query.bigqueryConsecutiveErrorsGetJob + 1;
            }

            await this.db.writeUnwrap({
              insertOrUpdate: {
                queries: [query]
              }
            });

            return;
          });

        query.bigqueryConsecutiveErrorsGetJob = 0;

        await this.db.writeUnwrap({
          insertOrUpdate: {
            queries: [query]
          }
        });

        let queryJob = (itemQueryJob as any)[0];
        let queryJobGetResponse: any = (itemQueryJob as any)[1];

        if (queryJobGetResponse.status.state === 'DONE') {
          if (queryJobGetResponse.status.errorResult) {
            let errorResult = queryJobGetResponse.status.errorResult;

            query.status = 'Error';
            query.data = [];
            query.lastErrorMessage =
              `Query fail. ` +
              `Message: '${errorResult.message}'. ` +
              `Reason: '${errorResult.reason}'. ` +
              `Location: '${errorResult.location}'.`;
            query.lastErrorTs = makeTsNumber();

            await this.db.writeUnwrap({
              insertOrUpdate: {
                queries: [query]
              }
            });
          } else {
            let queryResultsItem = await queryJob
              .getQueryResults()
              .catch(async (e: any) => {
                if (query.bigqueryConsecutiveErrorsGetResults > 2) {
                  query.status = 'Error';
                  query.data = [];
                  query.lastErrorMessage = `Bigquery get QueryResults fail`;
                  query.lastErrorTs = makeTsNumber();
                } else {
                  query.bigqueryConsecutiveErrorsGetResults =
                    query.bigqueryConsecutiveErrorsGetResults + 1;
                }

                await this.db.writeUnwrap({
                  insertOrUpdate: {
                    queries: [query]
                  }
                });

                return;
              });

            let newLastCompleteTs = makeTsNumber();
            let newLastCompleteDuration = Math.floor(
              (Number(newLastCompleteTs) - Number(query.lastRunTs)) / 1000
            );

            query.status = 'Completed';
            // no need for query.bigquery_consecutive_errors_get_results = 0
            // because status change to Completed
            query.data = queryResultsItem[0];
            query.lastCompleteTs = newLastCompleteTs;
            query.lastCompleteDuration = newLastCompleteDuration;

            await this.db.writeUnwrap({
              insertOrUpdate: {
                queries: [query]
              }
            });
          }
        }
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERY',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      }
    });

    return Result.succeed();
  }
}
