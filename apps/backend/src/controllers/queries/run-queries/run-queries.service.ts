import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { Credentials } from 'google-auth-library';
import { JWT } from 'google-auth-library';
import type { BackendConfig } from '#backend/config/backend-config';
import type { PackerOutput } from '#backend/drizzle/postgres/drizzle-packer';
import type {
  BranchTab,
  BridgeTab,
  ConnectionTab,
  EnvTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { BigQueryService } from '#backend/services/dwh/bigquery/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql/mysql.service';
import { PgService } from '#backend/services/dwh/pg/pg.service';
import { PrestoService } from '#backend/services/dwh/presto/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino/trino.service';
import { ParentService } from '#backend/services/parent/parent.service';
import { StoreService } from '#backend/services/store/store.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { CheckParentAccessError } from '#common/types/backend/function-errors/check-parent-access-error';
import type { CustomAsyncPoolError } from '#common/types/backend/function-errors/custom-async-pool-error';
import type { DbBranchesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/branches/db-branches-find-first-check-exists-error';
import type { DbBridgesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-check-exists-error';
import type { DbConnectionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/connections/db-connections-find-first-check-exists-error';
import type { DbConnectionsFindManyError } from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import type { DbMconfigsFindManyError } from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-many-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { DbModelsFindManyError } from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { GetQueriesCheckExistSkipSqlDataError } from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import type { GetQueryCheckExistsSkipDataError } from '#common/types/backend/function-errors/get-query-check-exists-skip-data-error';
import type { GetQueryExecutionContextError } from '#common/types/backend/function-errors/get-query-execution-context-error';
import type { LaunchPooledQueryError } from '#common/types/backend/function-errors/launch-pooled-query-error';
import type { RunPooledQueryError } from '#common/types/backend/function-errors/run-pooled-query-error';
import type { RunQueriesError } from '#common/types/backend/function-errors/run-queries-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import type { Env } from '#common/types/backend/parts/env';
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
    private parentService: ParentService,
    private structsService: StructsService,
    private queriesService: QueriesService,
    private db: DbService,
    private sessionsService: SessionsService,
    private pgService: PgService,
    private mysqlService: MysqlService,
    private databricksService: DatabricksService,
    private duckdbService: DuckDbService,
    private prestoService: PrestoService,
    private trinoService: TrinoService,
    private storeService: StoreService,
    private bigqueryService: BigQueryService,
    private envsService: EnvsService,
    private snowflakeService: SnowFlakeService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
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
      Result.bind(
        'query',
        (v): Result.ResultAsync<QueryTab, GetQueryCheckExistsSkipDataError> =>
          this.queriesService.getQueryCheckExistsSkipData({
            projectId: v.projectId,
            queryId: v.queryId
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
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsError> =>
          this.envsService.getApiEnvs({ projectId: v.projectId })
      ),
      Result.bind(
        'apiEnv',
        (v): Result.Result<Env, never> =>
          Result.succeed(v.apiEnvs.find(x => x.envId === v.query.envId))
      ),
      Result.bind(
        'connection',
        async (
          v
        ): Result.ResultAsync<
          ConnectionTab,
          DbConnectionsFindFirstCheckExistsError
        > => {
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
        }
      ),
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
      query = await this.bigqueryService.runQuery({
        userId: userId,
        query: query,
        connection: connection
      });

      let persistenceResult: Result.Result<PackerOutput, WriteError> =
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

      let persistenceResult: Result.Result<PackerOutput, WriteError> =
        await this.db.write({
          insertOrUpdate: { queries: [query] }
        });

      if (Result.isFailure(persistenceResult)) {
        return persistenceResult;
      }

      if (connection.type === 'SnowFlake') {
        await this.snowflakeService.runQuery({
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'PostgreSQL') {
        await this.pgService.runQuery({
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'MySQL') {
        await this.mysqlService.runQuery({
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'MotherDuck') {
        await this.duckdbService.runQuery({
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'Presto') {
        await this.prestoService.runQuery({
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'Trino') {
        await this.trinoService.runQuery({
          connection: connection,
          queryId: query.queryId,
          queryJobId: query.queryJobId,
          querySql: query.sql,
          projectId: projectId
        });
      } else if (connection.type === 'Databricks') {
        await this.databricksService.runQuery({
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

        await this.storeService.runQuery({
          projectId: projectId,
          connection: connection,
          model: model,
          queryId: query.queryId,
          queryJobId: query.queryJobId
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
      query = await this.bigqueryService.runQuery({
        userId: userId,
        query: query,
        connection: connection
      });

      let persistenceResult: Result.Result<PackerOutput, WriteError> =
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

      let persistenceResult: Result.Result<PackerOutput, WriteError> =
        await this.db.write({
          insertOrUpdate: { queries: [query] }
        });

      if (Result.isFailure(persistenceResult)) {
        return persistenceResult;
      }

      runningQueries.push(query);

      if (connection.type === 'SnowFlake') {
        void this.snowflakeService
          .runQuery({
            connection: connection,
            queryId: query.queryId,
            queryJobId: query.queryJobId,
            querySql: query.sql,
            projectId: projectId
          })
          .catch(e => {
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
        void this.pgService
          .runQuery({
            connection: connection,
            queryId: query.queryId,
            queryJobId: query.queryJobId,
            querySql: query.sql,
            projectId: projectId
          })
          .catch(e => {
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
        void this.mysqlService
          .runQuery({
            connection: connection,
            queryId: query.queryId,
            queryJobId: query.queryJobId,
            querySql: query.sql,
            projectId: projectId
          })
          .catch(e => {
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
        void this.prestoService
          .runQuery({
            connection: connection,
            queryId: query.queryId,
            queryJobId: query.queryJobId,
            querySql: query.sql,
            projectId: projectId
          })
          .catch(e => {
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
        void this.trinoService
          .runQuery({
            connection: connection,
            queryId: query.queryId,
            queryJobId: query.queryJobId,
            querySql: query.sql,
            projectId: projectId
          })
          .catch(e => {
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
        void this.duckdbService
          .runQuery({
            connection: connection,
            queryId: query.queryId,
            queryJobId: query.queryJobId,
            querySql: query.sql,
            projectId: projectId
          })
          .catch(e => {
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
        void this.databricksService
          .runQuery({
            connection: connection,
            queryId: query.queryId,
            queryJobId: query.queryJobId,
            querySql: query.sql,
            projectId: projectId
          })
          .catch(e => {
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

        void this.storeService
          .runQuery({
            projectId: projectId,
            connection: connection,
            model: model,
            queryId: query.queryId,
            queryJobId: query.queryJobId
          })
          .catch(e => {
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
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<MemberTab, DbMembersFindFirstCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.user.userId),
              eq(membersTable.projectId, v.projectId)
            )
          })
      ),
      Result.bind(
        'branch',
        (
          v
        ): Result.ResultAsync<BranchTab, DbBranchesFindFirstCheckExistsError> =>
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
        > = await this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        });

        if (Result.isFailure(envAccessResult)) {
          return envAccessResult;
        }

        return Result.succeed();
      }),
      Result.bind(
        'bridge',
        (
          v
        ): Result.ResultAsync<BridgeTab, DbBridgesFindFirstCheckExistsError> =>
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
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'mconfigs',
        (v): Result.ResultAsync<MconfigTab[], DbMconfigsFindManyError> =>
          this.db.mconfigs.findMany({
            where: and(
              eq(mconfigsTable.structId, v.bridge.structId),
              inArray(mconfigsTable.mconfigId, v.mconfigIds)
            )
          })
      ),
      Result.bind(
        'uniqueParentIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([...new Set(v.mconfigs.map(x => x.parentId))])
      ),
      Result.andThrough(async v => {
        let parentAccessChecksResult: Result.Result<
          void[],
          CheckParentAccessError
        > = await Result.sequence(
          v.uniqueParentIds,
          async (
            parentId
          ): Result.ResultAsync<void, CheckParentAccessError> => {
            let mconfig: MconfigTab = v.mconfigs.find(
              x => x.parentId === parentId
            );

            let parentAccessResult: Result.Result<
              void,
              CheckParentAccessError
            > = await this.parentService.checkParentAccess({
              parentId: mconfig.parentId,
              parentType: mconfig.parentType,
              modelId: mconfig.modelId,
              user: v.user,
              userMember: v.userMember,
              structId: v.bridge.structId,
              projectId: v.projectId
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
      Result.bind(
        'queryIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([...new Set(v.mconfigs.map(x => x.queryId))])
      ),
      Result.bind(
        'queries',
        (
          v
        ): Result.ResultAsync<
          QueryTab[],
          GetQueriesCheckExistSkipSqlDataError
        > =>
          this.queriesService.getQueriesCheckExistSkipSqlData({
            queryIds: v.queryIds,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'modelIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([...new Set(v.mconfigs.map(x => x.modelId))])
      ),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], DbModelsFindManyError> =>
          this.db.models.findMany({
            where: and(
              eq(modelsTable.structId, v.bridge.structId),
              inArray(modelsTable.modelId, v.modelIds)
            )
          })
      ),
      Result.bind(
        'prepareQueryExecutionPayload',
        (v): Result.Result<PrepareQueryExecutionPayload, never> => {
          let runningQueries: QueryTab[] = [];

          let startedQueryIds: string[] = [];

          let googleApiConnectionIds: string[] = v.queries
            .filter(query => query.connectionType === 'GoogleApi')
            .map(query => query.connectionId);

          let uniqueGoogleApiConnectionIdsWithAnyEnvId: string[] = [
            ...new Set(googleApiConnectionIds)
          ];

          return Result.succeed({
            runningQueries: runningQueries,
            startedQueryIds: startedQueryIds,
            googleApiConnectionIds: googleApiConnectionIds,
            uniqueGoogleApiConnectionIdsWithAnyEnvId:
              uniqueGoogleApiConnectionIdsWithAnyEnvId
          });
        }
      ),
      Result.bind(
        'uniqueGoogleApiConnectionsWithAnyEnvId',
        (v): Result.ResultAsync<ConnectionTab[], DbConnectionsFindManyError> =>
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

                let persistenceResult: Result.Result<PackerOutput, WriteError> =
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
            this.queriesService.tabToApi({ query: x })
          ),
          startedQueryIds: v.prepareQueryExecutionPayload.startedQueryIds
        })
      )
    );
  }
}
