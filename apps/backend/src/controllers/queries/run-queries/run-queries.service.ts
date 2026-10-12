import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { Credentials } from 'google-auth-library';
import { JWT } from 'google-auth-library';
import asyncPool from 'tiny-async-pool';
import type { z } from 'zod';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
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
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
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
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { CheckParentAccessError } from '#common/types/backend/function-errors/check-parent-access-error';
import type { ConnectionEntToTabError } from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetQueriesCheckExistSkipSqlDataError } from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { RunQueriesError } from '#common/types/backend/function-errors/run-queries-error';
import {
  RunQueriesSetupErrorToError,
  zRunQueriesSetupErrorToError
} from '#common/types/backend/function-errors/run-queries-setup-error-to-error';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import type { ToBackendRunQueriesOutput } from '#common/types/backend/routes/queries/run-queries/run-queries-output';

type PrepareQueryExecutionPayload = {
  runningQueries: QueryTab[];
  startedQueryIds: string[];
  googleApiConnectionIds: string[];
  uniqueGoogleApiConnectionIdsWithAnyEnvId: string[];
};

const apiConnectionTypes = ['Api', 'GoogleApi'] satisfies ConnectionType[];

@Injectable()
export class RunQueriesService {
  constructor(
    private tabService: TabService,
    private parentService: ParentService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private connectionsService: ConnectionsService,
    private membersService: MembersService,
    private pgService: PgService,
    private mysqlService: MysqlService,
    private databricksService: DatabricksService,
    private duckdbService: DuckDbService,
    private prestoService: PrestoService,
    private trinoService: TrinoService,
    private storeService: StoreService,
    // private clickhouseService: ClickHouseService,
    private bigqueryService: BigQueryService,
    private envsService: EnvsService,
    private snowflakeService: SnowFlakeService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async runQueries(item: {
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
      await this.runQueriesResult({
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

  async runQueriesResult(item: {
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
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(async v => {
        let envAccessResult: Result.Result<
          EnvTab,
          GetEnvCheckExistsAndAccessError
        > = await this.envsService.getEnvCheckExistsAndAccessResult({
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
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.andThrough(v =>
        this.structsService.getStructCheckExistsResult({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'mconfigs',
        (v): Result.ResultAsync<MconfigTab[], MconfigEntToTabError> =>
          this.db.drizzle.query.mconfigsTable
            .findMany({
              where: and(
                eq(mconfigsTable.structId, v.bridge.structId),
                inArray(mconfigsTable.mconfigId, v.mconfigIds)
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                isUndefined(x)
                  ? Result.succeed(undefined)
                  : this.tabService.mconfigEntToTabResult({
                      mconfigEnt: x
                    })
              )
            )
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
            > = await this.parentService.checkParentAccessResult({
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
          this.queriesService.getQueriesCheckExistSkipSqlDataResult({
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
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.drizzle.query.modelsTable
            .findMany({
              where: and(
                eq(modelsTable.structId, v.bridge.structId),
                inArray(modelsTable.modelId, v.modelIds)
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                isUndefined(x)
                  ? Result.succeed(undefined)
                  : this.tabService.modelEntToTabResult({
                      modelEnt: x
                    })
              )
            )
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
        (v): Result.ResultAsync<ConnectionTab[], ConnectionEntToTabError> =>
          this.db.drizzle.query.connectionsTable
            .findMany({
              where: and(
                eq(connectionsTable.projectId, v.projectId),
                inArray(
                  connectionsTable.connectionId,
                  v.prepareQueryExecutionPayload
                    .uniqueGoogleApiConnectionIdsWithAnyEnvId
                )
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                isUndefined(x)
                  ? Result.succeed(undefined)
                  : this.tabService.connectionEntToTabResult({
                      connectionEnt: x
                    })
              )
            )
      ),
      Result.andThrough(async v => {
        let connectionRefreshResult: Result.Result<void[], DbErrorToError> =
          await Result.sequence(
            v.uniqueGoogleApiConnectionsWithAnyEnvId,
            async (connection): Result.ResultAsync<void, DbErrorToError> => {
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

                let persistenceResult: Result.Result<void, DbErrorToError> =
                  await dbErrorToResult({
                    action: async () => {
                      await retry(
                        async () =>
                          await this.db.drizzle.transaction(
                            async tx =>
                              await this.db.packer.write({
                                tx: tx,
                                insertOrUpdate: {
                                  connections: [connection]
                                }
                              })
                          ),
                        getRetryOption(this.cs, this.logger)
                      );
                    }
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

          void asyncPool(pSize, v.queryIds, async queryId => {
            let query = await this.queriesService.getQueryCheckExistsSkipData({
              projectId: v.projectId,
              queryId: queryId
            });

            await this.membersService.getMemberCheckExists({
              projectId: query.projectId,
              memberId: v.user.userId
            });

            let apiEnvs = await this.envsService.getApiEnvs({
              projectId: v.projectId
            });

            let apiEnv = apiEnvs.find(x => x.envId === query.envId);

            let connection: ConnectionTab =
              await this.connectionsService.getConnectionCheckExists({
                projectId: query.projectId,
                envId:
                  apiEnv.isFallbackToProdConnections === true &&
                  apiEnv.fallbackConnectionIds.indexOf(query.connectionId) > -1
                    ? PROJECT_ENV_PROD
                    : query.envId,
                connectionId: query.connectionId
              });

            if (connection.type === 'BigQuery') {
              query = await this.bigqueryService.runQuery({
                userId: v.user.userId,
                query: query,
                connection: connection
              });

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
              query.status = 'Running';

              query.queryJobId = makeId();

              query.lastRunBy = v.user.userId;

              query.lastRunTs = makeTsNumber();

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

              if (connection.type === 'SnowFlake') {
                await this.snowflakeService.runQuery({
                  connection: connection,
                  queryId: query.queryId,
                  queryJobId: query.queryJobId,
                  querySql: query.sql,
                  projectId: v.projectId
                });
              } else if (connection.type === 'PostgreSQL') {
                await this.pgService.runQuery({
                  connection: connection,
                  queryId: query.queryId,
                  queryJobId: query.queryJobId,
                  querySql: query.sql,
                  projectId: v.projectId
                });
              } else if (connection.type === 'MySQL') {
                await this.mysqlService.runQuery({
                  connection: connection,
                  queryId: query.queryId,
                  queryJobId: query.queryJobId,
                  querySql: query.sql,
                  projectId: v.projectId
                });
              } else if (connection.type === 'MotherDuck') {
                await this.duckdbService.runQuery({
                  connection: connection,
                  queryId: query.queryId,
                  queryJobId: query.queryJobId,
                  querySql: query.sql,
                  projectId: v.projectId
                });
              } else if (connection.type === 'Presto') {
                await this.prestoService.runQuery({
                  connection: connection,
                  queryId: query.queryId,
                  queryJobId: query.queryJobId,
                  querySql: query.sql,
                  projectId: v.projectId
                });
              } else if (connection.type === 'Trino') {
                await this.trinoService.runQuery({
                  connection: connection,
                  queryId: query.queryId,
                  queryJobId: query.queryJobId,
                  querySql: query.sql,
                  projectId: v.projectId
                });
              } else if (connection.type === 'Databricks') {
                await this.databricksService.runQuery({
                  connection: connection,
                  queryId: query.queryId,
                  queryJobId: query.queryJobId,
                  querySql: query.sql,
                  projectId: v.projectId
                });
              } else if (
                apiConnectionTypes.findIndex(
                  candidate => candidate === connection.type
                ) > -1
              ) {
                let mconfig = v.mconfigs.find(x => x.queryId === query.queryId);

                let model = v.models.find(x => x.modelId === mconfig.modelId);

                await this.storeService.runQuery({
                  projectId: v.projectId,
                  connection: connection,
                  model: model,
                  queryId: query.queryId,
                  queryJobId: query.queryJobId
                });
              }
            }
          }).catch(e => {
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
          try {
            await asyncPool(8, v.queryIds, async queryId => {
              let query = await this.queriesService.getQueryCheckExistsSkipData(
                {
                  projectId: v.projectId,
                  queryId: queryId
                }
              );

              await this.membersService.getMemberCheckExists({
                projectId: query.projectId,
                memberId: v.user.userId
              });

              let apiEnvs = await this.envsService.getApiEnvs({
                projectId: v.projectId
              });

              let apiEnv = apiEnvs.find(x => x.envId === query.envId);

              let connection: ConnectionTab =
                await this.connectionsService.getConnectionCheckExists({
                  projectId: query.projectId,
                  envId:
                    apiEnv.isFallbackToProdConnections === true &&
                    apiEnv.fallbackConnectionIds.indexOf(query.connectionId) >
                      -1
                      ? PROJECT_ENV_PROD
                      : query.envId,
                  connectionId: query.connectionId
                });

              if (connection.type === 'BigQuery') {
                query = await this.bigqueryService.runQuery({
                  userId: v.user.userId,
                  query: query,
                  connection: connection
                });

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

                v.prepareQueryExecutionPayload.runningQueries.push(query);
              } else {
                query.status = 'Running';

                query.queryJobId = makeId();

                query.lastRunBy = v.user.userId;

                query.lastRunTs = makeTsNumber();

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

                v.prepareQueryExecutionPayload.runningQueries.push(query);

                if (connection.type === 'SnowFlake') {
                  void this.snowflakeService
                    .runQuery({
                      connection: connection,
                      queryId: query.queryId,
                      queryJobId: query.queryJobId,
                      querySql: query.sql,
                      projectId: v.projectId
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
                      projectId: v.projectId
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
                      projectId: v.projectId
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
                      projectId: v.projectId
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
                      projectId: v.projectId
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
                      projectId: v.projectId
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
                      projectId: v.projectId
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
                  apiConnectionTypes.findIndex(
                    candidate => candidate === connection.type
                  ) > -1
                ) {
                  let mconfig = v.mconfigs.find(
                    x => x.queryId === query.queryId
                  );

                  let model = v.models.find(x => x.modelId === mconfig.modelId);

                  void this.storeService
                    .runQuery({
                      projectId: v.projectId,
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
            });
          } catch (error) {
            if (!(error instanceof ServerError)) {
              throw error;
            }

            let parsed: z.ZodSafeParseResult<RunQueriesSetupErrorToError> =
              zRunQueriesSetupErrorToError.safeParse({
                code: error.message
              });

            if (parsed.success === false) {
              throw error;
            }

            return Result.fail(parsed.data);
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
