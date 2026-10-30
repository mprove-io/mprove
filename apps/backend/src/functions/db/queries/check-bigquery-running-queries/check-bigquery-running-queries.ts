import { BigQuery, type Job } from '@google-cloud/bigquery';
import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import asyncPool from 'tiny-async-pool';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/ts/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckBigqueryRunningQueriesError } from '#common/types/backend/function-errors/check-bigquery-running-queries-error';
import type { DbQueriesFindManyError } from '#common/types/backend/function-errors/db/queries/db-queries-find-many-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { Env } from '#common/types/backend/parts/env';

export async function checkBigqueryRunningQueries(item: {
  db: DbService;
  logger: Logger;
  cs: ConfigService<BackendConfig>;
}): Result.ResultAsync<void, CheckBigqueryRunningQueriesError> {
  let { db, logger, cs } = item;

  let queryCollection: Result.Result<QueryTab[], DbQueriesFindManyError> =
    await db.queries.findMany({
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
        await getApiEnvs({
          db: db,
          projectId: query.projectId
        });

      if (Result.isFailure(apiEnvsResult)) {
        throw new ServerError({ message: apiEnvsResult.error.code });
      }

      let apiEnvs: Env[] = apiEnvsResult.value;

      let apiEnv: Env = apiEnvs.find(x => x.envId === query.envId);

      let connection: ConnectionTab = await db.connections.findFirstUnwrap({
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

        await db.writeUnwrap({
          insertOrUpdate: {
            queries: [query]
          }
        });

        return;
      }

      let bigquery: BigQuery = new BigQuery({
        credentials: connection.options.bigquery.serviceAccountCredentials,
        projectId: connection.options.bigquery.googleCloudProject
      });

      let bigqueryQueryJob: Job = bigquery.job(query.bigqueryQueryJobId);

      let itemQueryJob: [unknown, unknown] | void = await bigqueryQueryJob
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

          await db.writeUnwrap({
            insertOrUpdate: {
              queries: [query]
            }
          });

          return;
        });

      query.bigqueryConsecutiveErrorsGetJob = 0;

      await db.writeUnwrap({
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

          await db.writeUnwrap({
            insertOrUpdate: {
              queries: [query]
            }
          });
        } else {
          let queryResultsItem: any = await queryJob
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

              await db.writeUnwrap({
                insertOrUpdate: {
                  queries: [query]
                }
              });

              return;
            });

          let newLastCompleteTs: number = makeTsNumber();

          let newLastCompleteDuration: number = Math.floor(
            (Number(newLastCompleteTs) - Number(query.lastRunTs)) / 1000
          );

          query.status = 'Completed';

          // no need for query.bigquery_consecutive_errors_get_results = 0
          // because status change to Completed
          query.data = queryResultsItem[0];

          query.lastCompleteTs = newLastCompleteTs;

          query.lastCompleteDuration = newLastCompleteDuration;

          await db.writeUnwrap({
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
        logger: logger,
        cs: cs
      });
    }
  });

  return Result.succeed();
}
