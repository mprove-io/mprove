import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import { type Credentials, JWT } from 'google-auth-library';
import type { BackendConfig } from '#backend/config/backend-config';
import { runQuery } from '#backend/controllers/queries/run-queries/run-query/run-query';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import type { EnvTab } from '#backend/drizzle/postgres/tables/envs';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkRepoId } from '#backend/functions/check-repo-id/check-repo-id';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { checkParentMemberAccess } from '#backend/functions/db/members/check-parent-member-access/check-parent-member-access';
import { getQueriesCheckExistSkipSqlData } from '#backend/functions/db/queries/get-queries-check-exist-skip-sql-data/get-queries-check-exist-skip-sql-data';
import { getQueryCheckExistsSkipData } from '#backend/functions/db/queries/get-query-check-exists-skip-data/get-query-check-exists-skip-data';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { runBigqueryQuery } from '#backend/functions/dwh/bigquery/run-bigquery-query/run-bigquery-query';
import { runDatabricksQuery } from '#backend/functions/dwh/databricks/run-databricks-query/run-databricks-query';
import { runDuckdbQuery } from '#backend/functions/dwh/duckdb/run-duckdb-query/run-duckdb-query';
import { runMysqlQuery } from '#backend/functions/dwh/mysql/run-mysql-query/run-mysql-query';
import { runPgQuery } from '#backend/functions/dwh/pg/run-pg-query/run-pg-query';
import { runPrestoQuery } from '#backend/functions/dwh/presto/run-presto-query/run-presto-query';
import { runSnowflakeQuery } from '#backend/functions/dwh/snowflake/run-snowflake-query/run-snowflake-query';
import { runTrinoQuery } from '#backend/functions/dwh/trino/run-trino-query/run-trino-query';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { makeTsNumber } from '#backend/functions/ts/make-ts-number/make-ts-number';
import { DbService } from '#backend/services/db/db.service';
import { UrlService } from '#backend/services/url/url.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { CheckParentMemberAccessError } from '#common/types/backend/function-errors/check-parent-member-access-error';
import type { CustomAsyncPoolError } from '#common/types/backend/function-errors/custom-async-pool-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { GetQueryExecutionContextError } from '#common/types/backend/function-errors/get-query-execution-context-error';
import type { LaunchPooledQueryError } from '#common/types/backend/function-errors/launch-pooled-query-error';
import type { RunPooledQueryError } from '#common/types/backend/function-errors/run-pooled-query-error';
import type { RunQueriesError } from '#common/types/backend/function-errors/run-queries-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import type { ToBackendRunQueriesOutput } from '#common/types/backend/routes/queries/run-queries/run-queries-output';
import { customAsyncPool } from '#node-common/functions/custom-async-pool/custom-async-pool';

type PrepareQueryExecutionPayload = {
  runningQueries: QueryTab[];
  startedQueryIds: string[];
  googleApiConnectionIds: string[];
  uniqueGoogleApiConnectionIdsWithAnyEnvId: string[];
};

type GetQueryExecutionContextOutput = {
  query: QueryTab;
  connection: ConnectionTab;
};

const apiConnectionTypes = ['Api', 'GoogleApi'] satisfies ConnectionType[];

@Injectable()
export class RunQueriesService {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private urlService: UrlService
  ) {}

  private async getQueryExecutionContext(item: {
    projectId: string;
    queryId: string;
    userId: string;
  }): Result.ResultAsync<
    GetQueryExecutionContextOutput,
    GetQueryExecutionContextError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('query', v =>
        getQueryCheckExistsSkipData({
          projectId: v.projectId,
          queryId: v.queryId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.query.projectId)
          )
        })
      ),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.bind('apiEnv', v =>
        Result.succeed(v.apiEnvs.find(x => x.envId === v.query.envId))
      ),
      Result.bind('connection', async v => {
        let isFallbackConnection: boolean =
          v.apiEnv.isFallbackToProdConnections === true
            ? v.apiEnv.fallbackConnectionIds.includes(v.query.connectionId)
            : false;

        return this.db.connections.findFirstCheckExists({
          where: and(
            eq(connectionsTable.connectionId, v.query.connectionId),
            eq(
              connectionsTable.envId,
              isFallbackConnection ? PROJECT_ENV_PROD : v.query.envId
            ),
            eq(connectionsTable.projectId, v.query.projectId)
          )
        });
      }),
      Result.map(
        (v): GetQueryExecutionContextOutput => ({
          query: v.query,
          connection: v.connection
        })
      )
    );
  }

  private async runPooledQuery(item: {
    projectId: string;
    queryId: string;
    userId: string;
    mconfigs: MconfigTab[];
    models: ModelTab[];
  }): Result.ResultAsync<void, RunPooledQueryError> {
    let { projectId, queryId, userId, mconfigs, models } = item;

    let getQueryExecutionContextOutput: Result.Result<
      GetQueryExecutionContextOutput,
      GetQueryExecutionContextError
    > = await this.getQueryExecutionContext({
      projectId: projectId,
      queryId: queryId,
      userId: userId
    });

    if (Result.isFailure(getQueryExecutionContextOutput)) {
      return getQueryExecutionContextOutput;
    }

    let { query, connection } = getQueryExecutionContextOutput.value;

    if (connection.type === 'BigQuery') {
      query = await runBigqueryQuery({
        userId: userId,
        query: query,
        connection: connection
      });

      let persistenceResult: Result.Result<void, WriteError> =
        await this.db.write({
          insertOrUpdate: { queries: [query] }
        });

      if (Result.isFailure(persistenceResult)) {
        return persistenceResult;
      }
    } else {
      query.status = 'Running';

      query.queryJobId = makeId();

      query.lastRunBy = userId;

      query.lastRunTs = makeTsNumber();

      let persistenceResult: Result.Result<void, WriteError> =
        await this.db.write({
          insertOrUpdate: { queries: [query] }
        });

      if (Result.isFailure(persistenceResult)) {
        return persistenceResult;
      }

      if (connection.type === 'SnowFlake') {
        await runSnowflakeQuery({
          cs: this.cs,
          logger: this.logger,
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'PostgreSQL') {
        await runPgQuery({
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'MySQL') {
        await runMysqlQuery({
          cs: this.cs,
          logger: this.logger,
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'MotherDuck') {
        await runDuckdbQuery({
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'Presto') {
        await runPrestoQuery({
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'Trino') {
        await runTrinoQuery({
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'Databricks') {
        await runDatabricksQuery({
          cs: this.cs,
          logger: this.logger,
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (
        apiConnectionTypes.some(candidate => candidate === connection.type)
      ) {
        let mconfig: MconfigTab = mconfigs.find(
          x => x.queryId === query.queryId
        );

        let model: ModelTab = models.find(x => x.modelId === mconfig.modelId);

        await runQuery({
          projectId: projectId,
          connection: connection,
          model: model,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          db: this.db,
          urlService: this.urlService
        });
      }
    }

    return Result.succeed();
  }

  private async launchPooledQuery(item: {
    projectId: string;
    queryId: string;
    userId: string;
    mconfigs: MconfigTab[];
    models: ModelTab[];
    runningQueries: QueryTab[];
  }): Result.ResultAsync<void, LaunchPooledQueryError> {
    let { projectId, queryId, userId, mconfigs, models, runningQueries } = item;

    let getQueryExecutionContextOutput: Result.Result<
      GetQueryExecutionContextOutput,
      GetQueryExecutionContextError
    > = await this.getQueryExecutionContext({
      projectId: projectId,
      queryId: queryId,
      userId: userId
    });

    if (Result.isFailure(getQueryExecutionContextOutput)) {
      return getQueryExecutionContextOutput;
    }

    let { query, connection } = getQueryExecutionContextOutput.value;

    if (connection.type === 'BigQuery') {
      query = await runBigqueryQuery({
        userId: userId,
        query: query,
        connection: connection
      });

      let persistenceResult: Result.Result<void, WriteError> =
        await this.db.write({
          insertOrUpdate: { queries: [query] }
        });

      if (Result.isFailure(persistenceResult)) {
        return persistenceResult;
      }

      runningQueries.push(query);
    } else {
      query.status = 'Running';

      query.queryJobId = makeId();

      query.lastRunBy = userId;

      query.lastRunTs = makeTsNumber();

      let persistenceResult: Result.Result<void, WriteError> =
        await this.db.write({
          insertOrUpdate: { queries: [query] }
        });

      if (Result.isFailure(persistenceResult)) {
        return persistenceResult;
      }

      runningQueries.push(query);

      if (connection.type === 'SnowFlake') {
        void runSnowflakeQuery({
          cs: this.cs,
          logger: this.logger,
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        }).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_RUN_QUERY_SNOWFLAKE_ERROR',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
      } else if (connection.type === 'PostgreSQL') {
        void runPgQuery({
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        }).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_RUN_QUERY_POSTGRES_ERROR',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
      } else if (connection.type === 'MySQL') {
        void runMysqlQuery({
          cs: this.cs,
          logger: this.logger,
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        }).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_RUN_QUERY_MYSQL_ERROR',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
      } else if (connection.type === 'Presto') {
        void runPrestoQuery({
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        }).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_RUN_QUERY_PRESTO_ERROR',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
      } else if (connection.type === 'Trino') {
        void runTrinoQuery({
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        }).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_RUN_QUERY_TRINO_ERROR',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
      } else if (connection.type === 'MotherDuck') {
        void runDuckdbQuery({
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        }).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_RUN_QUERY_DUCKDB_ERROR',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
      } else if (connection.type === 'Databricks') {
        void runDatabricksQuery({
          cs: this.cs,
          logger: this.logger,
          db: this.db,
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        }).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_RUN_QUERY_DATABRICKS_ERROR',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
      } else if (
        apiConnectionTypes.some(candidate => candidate === connection.type)
      ) {
        let mconfig: MconfigTab = mconfigs.find(
          x => x.queryId === query.queryId
        );

        let model: ModelTab = models.find(x => x.modelId === mconfig.modelId);

        void runQuery({
          projectId: projectId,
          connection: connection,
          model: model,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          db: this.db,
          urlService: this.urlService
        }).catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_RUN_QUERY_API_ERROR',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
      }
    }

    return Result.succeed();
  }

  async runQueriesUnwrap(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    mconfigIds: string[];
    poolSize?: number;
  }): Promise<ToBackendRunQueriesOutput> {
    let { user, projectId, repoId, branchId, envId, mconfigIds, poolSize } =
      item;

    let result: Result.Result<ToBackendRunQueriesOutput, RunQueriesError> =
      await this.runQueries({
        user: user,
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        mconfigIds: mconfigIds,
        poolSize: poolSize
      });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          'displayData' in result.error ? result.error.displayData : undefined,
        customData: 'info' in result.error ? result.error.info : undefined
      });
    }

    let output: ToBackendRunQueriesOutput = result.value;

    return output;
  }

  async runQueries(item: {
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    mconfigIds: string[];
    poolSize?: number;
  }): Result.ResultAsync<ToBackendRunQueriesOutput, RunQueriesError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(async v => {
        let envAccessResult: Result.Result<
          EnvTab,
          GetEnvCheckExistsAndAccessError
        > = await getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        });

        if (Result.isFailure(envAccessResult)) {
          return envAccessResult;
        }

        return Result.succeed();
      }),
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.andThrough(v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
          db: this.db
        })
      ),
      Result.bind('mconfigs', v =>
        this.db.mconfigs.findMany({
          where: and(
            eq(mconfigsTable.structId, v.bridge.structId),
            inArray(mconfigsTable.mconfigId, v.mconfigIds)
          )
        })
      ),
      Result.bind('uniqueParentIds', v =>
        Result.succeed<string[]>([...new Set(v.mconfigs.map(x => x.parentId))])
      ),
      Result.andThrough(async v => {
        let parentAccessChecksResult: Result.Result<
          void[],
          CheckParentMemberAccessError
        > = await Result.sequence(
          v.uniqueParentIds,
          async (
            parentId
          ): Result.ResultAsync<void, CheckParentMemberAccessError> => {
            let mconfig: MconfigTab = v.mconfigs.find(
              x => x.parentId === parentId
            );

            let parentAccessResult: Result.Result<
              void,
              CheckParentMemberAccessError
            > = await checkParentMemberAccess({
              parentId: mconfig.parentId,
              parentType: mconfig.parentType,
              modelId: mconfig.modelId,
              user: v.user,
              userMember: v.userMember,
              structId: v.bridge.structId,
              projectId: v.projectId,
              db: this.db
            });

            if (Result.isFailure(parentAccessResult)) {
              return parentAccessResult;
            }

            return Result.succeed();
          }
        );

        if (Result.isFailure(parentAccessChecksResult)) {
          return parentAccessChecksResult;
        }

        return Result.succeed();
      }),
      Result.bind('queryIds', v =>
        Result.succeed<string[]>([...new Set(v.mconfigs.map(x => x.queryId))])
      ),
      Result.bind('queries', v =>
        getQueriesCheckExistSkipSqlData({
          queryIds: v.queryIds,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('modelIds', v =>
        Result.succeed<string[]>([...new Set(v.mconfigs.map(x => x.modelId))])
      ),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: and(
            eq(modelsTable.structId, v.bridge.structId),
            inArray(modelsTable.modelId, v.modelIds)
          )
        })
      ),
      Result.bind('prepareQueryExecutionPayload', v => {
        let runningQueries: QueryTab[] = [];

        let startedQueryIds: string[] = [];

        let googleApiConnectionIds: string[] = v.queries
          .filter(query => query.connectionType === 'GoogleApi')
          .map(query => query.connectionId);

        let uniqueGoogleApiConnectionIdsWithAnyEnvId: string[] = [
          ...new Set(googleApiConnectionIds)
        ];

        let prepareQueryExecutionPayload: PrepareQueryExecutionPayload = {
          runningQueries: runningQueries,
          startedQueryIds: startedQueryIds,
          googleApiConnectionIds: googleApiConnectionIds,
          uniqueGoogleApiConnectionIdsWithAnyEnvId:
            uniqueGoogleApiConnectionIdsWithAnyEnvId
        };

        return Result.succeed(prepareQueryExecutionPayload);
      }),
      Result.bind('uniqueGoogleApiConnectionsWithAnyEnvId', v =>
        this.db.connections.findMany({
          where: and(
            eq(connectionsTable.projectId, v.projectId),
            inArray(
              connectionsTable.connectionId,
              v.prepareQueryExecutionPayload
                .uniqueGoogleApiConnectionIdsWithAnyEnvId
            )
          )
        })
      ),
      Result.andThrough(async v => {
        let connectionRefreshResult: Result.Result<void[], WriteError> =
          await Result.sequence(
            v.uniqueGoogleApiConnectionsWithAnyEnvId,
            async (connection): Result.ResultAsync<void, WriteError> => {
              let currentTimeMs: number = Date.now();

              if (
                isUndefined(
                  connection.options.storeGoogleApi.googleAccessTokenExpiryDate
                ) ||
                connection.options.storeGoogleApi.googleAccessTokenExpiryDate <
                  currentTimeMs + 60 * 1000
              ) {
                let authClient: JWT = new JWT({
                  email:
                    connection.options.storeGoogleApi.serviceAccountCredentials
                      .client_email,
                  key: connection.options.storeGoogleApi
                    .serviceAccountCredentials.private_key,
                  scopes: connection.options.storeGoogleApi.googleAuthScopes
                });

                let tokens: Credentials = await authClient.authorize();

                connection.options.storeGoogleApi.googleAccessToken =
                  tokens.access_token;

                connection.options.storeGoogleApi.googleAccessTokenExpiryDate =
                  tokens.expiry_date;

                let persistenceResult: Result.Result<void, WriteError> =
                  await this.db.write({
                    insertOrUpdate: { connections: [connection] }
                  });

                if (Result.isFailure(persistenceResult)) {
                  return persistenceResult;
                }
              }

              return Result.succeed();
            }
          );

        if (Result.isFailure(connectionRefreshResult)) {
          return connectionRefreshResult;
        }

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        if (isDefined(v.poolSize)) {
          v.prepareQueryExecutionPayload.startedQueryIds = v.queryIds;

          let pSize: number = Number(v.poolSize);

          void customAsyncPool({
            poolSize: pSize,
            inputs: v.queryIds,
            callback: (
              queryId: string
            ): Result.ResultAsync<void, RunPooledQueryError> =>
              this.runPooledQuery({
                projectId: v.projectId,
                queryId: queryId,
                userId: v.user.userId,
                mconfigs: v.mconfigs,
                models: v.models
              })
          })
            .then(result => {
              if (Result.isFailure(result)) {
                throw new ServerError({ message: result.error.code });
              }
            })
            .catch(e => {
              logToConsoleBackend({
                log: new ServerError({
                  message: 'BACKEND_RUN_QUERIES_POOL_ERROR',
                  originalError: e
                }),
                logLevel: 'Error',
                logger: this.logger,
                cs: this.cs
              });
            });
        } else {
          let queryLaunchResult: Result.Result<
            void[],
            CustomAsyncPoolError<LaunchPooledQueryError>
          > = await customAsyncPool({
            poolSize: 8,
            inputs: v.queryIds,
            callback: (
              queryId: string
            ): Result.ResultAsync<void, LaunchPooledQueryError> =>
              this.launchPooledQuery({
                projectId: v.projectId,
                queryId: queryId,
                userId: v.user.userId,
                mconfigs: v.mconfigs,
                models: v.models,
                runningQueries: v.prepareQueryExecutionPayload.runningQueries
              })
          });

          if (Result.isFailure(queryLaunchResult)) {
            return queryLaunchResult;
          }
        }

        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendRunQueriesOutput => ({
          runningQueries: v.prepareQueryExecutionPayload.runningQueries.map(x =>
            queryTabToApi({
              query: x
            })
          ),
          startedQueryIds: v.prepareQueryExecutionPayload.startedQueryIds
        })
      )
    );
  }
}
