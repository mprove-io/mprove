import { BigQuery, type Job } from '@google-cloud/bigquery';
import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCancelQueriesRequestDto,
  ToBackendCancelQueriesResponseDto
} from '#backend/controllers/queries/cancel-queries/cancel-queries.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  ConnectionTab,
  MconfigTab,
  MemberTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ParentService } from '#backend/services/parent/parent.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendConnectionDoesNotExistError } from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import type { CancelQueryError } from '#common/types/backend/function-errors/cancel-query-error';
import type { ConnectionEntToTabError } from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetQueriesCheckExistSkipSqlDataError } from '#common/types/backend/function-errors/get-queries-check-exist-skip-sql-data-error';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCancelQueriesOutput } from '#common/types/backend/routes/queries/cancel-queries/cancel-queries-output';
import { asyncPoolResult } from '#node-common/functions/async-pool-result/async-pool-result';

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CancelQueriesController {
  constructor(
    private tabService: TabService,
    private parentService: ParentService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCancelQueries' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CancelQueries',
    description: 'Cancel running queries for specified mconfigs'
  })
  @ApiOkResponse({ type: ToBackendCancelQueriesResponseDto })
  async cancelQueries(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCancelQueriesRequestDto
  ): Promise<BackendResultForOperation<'cancelQueries'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        mconfigIds: body.input.mconfigIds,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExists({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExists({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.branchesService.getBranchCheckExists({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsError> =>
          this.bridgesService.getBridgeCheckExists({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
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
                this.tabService.mconfigEntToTab({ mconfigEnt: x })
              )
            )
      ),
      Result.bind(
        'uniqueParentIds',
        (v): Result.Result<string[], never> =>
          Result.succeed([...new Set(v.mconfigs.map(x => x.parentId))])
      ),
      Result.andThrough(v =>
        Result.sequence(v.uniqueParentIds, parentId => {
          let mconfig: MconfigTab = v.mconfigs.find(
            x => x.parentId === parentId
          );

          return this.parentService.checkParentAccess({
            parentId: mconfig.parentId,
            parentType: mconfig.parentType,
            modelId: mconfig.modelId,
            user: v.user,
            userMember: v.userMember,
            structId: v.bridge.structId,
            projectId: v.projectId
          });
        })
      ),
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
        'connectionsWithAnyEnvId',
        (v): Result.ResultAsync<ConnectionTab[], ConnectionEntToTabError> =>
          this.db.drizzle.query.connectionsTable
            .findMany({
              where: and(
                eq(connectionsTable.projectId, v.projectId),
                inArray(
                  connectionsTable.connectionId,
                  v.queries.map(q => q.connectionId)
                )
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.connectionEntToTab({ connectionEnt: x })
              )
            )
      ),
      Result.andThrough(v =>
        asyncPoolResult({
          poolSize: 8,
          inputs: v.queries.filter(q => q.status === 'Running'),
          callback: query =>
            this.cancelQueryResult({
              query: query,
              connectionsWithAnyEnvId: v.connectionsWithAnyEnvId
            })
        })
      ),
      Result.bind(
        'canceledQueries',
        (v): Result.Result<QueryTab[], never> =>
          Result.succeed(v.queries.filter(x => x.status === 'Canceled'))
      ),
      Result.andThrough(v =>
        v.canceledQueries.length === 0
          ? Result.succeed()
          : dbErrorToResult({
              action: async (): Promise<void> => {
                await retry(
                  async () =>
                    this.db.drizzle.transaction(async tx =>
                      this.db.packer.write({
                        tx: tx,
                        insertOrUpdate: { queries: v.canceledQueries }
                      })
                    ),
                  getRetryOption(this.cs, this.logger)
                );
              }
            })
      ),
      Result.map(
        (v): ToBackendCancelQueriesOutput => ({
          queries: v.canceledQueries.map(x =>
            this.queriesService.tabToApi({ query: x })
          )
        })
      )
    );
  }

  private async cancelQueryResult(item: {
    query: QueryTab;
    connectionsWithAnyEnvId: ConnectionTab[];
  }): Result.ResultAsync<void, CancelQueryError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsError> =>
          this.envsService.getApiEnvs({ projectId: v.query.projectId })
      ),
      Result.bind(
        'connection',
        (
          v
        ): Result.Result<ConnectionTab, BackendConnectionDoesNotExistError> => {
          let apiEnv: Env = v.apiEnvs.find(x => x.envId === v.query.envId);

          let connection: ConnectionTab = v.connectionsWithAnyEnvId.find(
            x =>
              x.connectionId === v.query.connectionId &&
              x.envId ===
                (apiEnv.fallbackConnectionIds.includes(v.query.connectionId)
                  ? PROJECT_ENV_PROD
                  : v.query.envId)
          );

          return isUndefined(connection)
            ? Result.fail({ code: 'BACKEND_CONNECTION_DOES_NOT_EXIST' })
            : Result.succeed(connection);
        }
      ),
      Result.andThrough(v => {
        if (v.connection.type === 'BigQuery') {
          let bigquery: BigQuery = new BigQuery({
            projectId: v.connection.options.bigquery.googleCloudProject,
            credentials: v.connection.options.bigquery.serviceAccountCredentials
          });

          let bigqueryQueryJob: Job = bigquery.job(v.query.bigqueryQueryJobId);

          void bigqueryQueryJob.cancel().catch((e: unknown) => {
            logToConsoleBackend({
              log: new ServerError({
                message: 'BACKEND_BIGQUERY_CANCEL_QUERY_JOB_FAIL',
                originalError: e
              }),
              logLevel: 'Error',
              logger: this.logger,
              cs: this.cs
            });
          });
        }

        return Result.succeed();
      }),
      Result.map(v => {
        v.query.status = 'Canceled';

        v.query.data = [];

        v.query.lastCancelTs = makeTsNumber();

        v.query.queryJobId = undefined;

        return v;
      }),
      Result.map((v): void => undefined)
    );
  }
}
