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
  ToBackendRunQueriesDryRequestDto,
  ToBackendRunQueriesDryResponseDto
} from '#backend/controllers/queries/run-queries-dry/run-queries-dry.dto';
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
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { BigQueryService } from '#backend/services/dwh/bigquery/bigquery.service';
import { ParentService } from '#backend/services/parent/parent.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetConnectionCheckExistsError } from '#common/types/backend/function-errors/get-connection-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetQueryCheckExistsSkipDataError } from '#common/types/backend/function-errors/get-query-check-exists-skip-data-error';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { RunQueryDryError } from '#common/types/backend/function-errors/run-query-dry-error';
import type { Env } from '#common/types/backend/parts/env';
import type { QueryEstimate } from '#common/types/backend/parts/query-estimate';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendRunQueriesDryOutput } from '#common/types/backend/routes/queries/run-queries-dry/run-queries-dry-output';
import { customAsyncPool } from '#node-common/functions/custom-async-pool/custom-async-pool';

type RunQueryDryOutput = {
  validEstimate?: QueryEstimate;
  errorQuery?: QueryTab;
};

@ApiTags('Queries')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RunQueriesDryController {
  constructor(
    private tabService: TabService,
    private parentService: ParentService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private connectionsService: ConnectionsService,
    private bigqueryService: BigQueryService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendRunQueriesDry' satisfies ToBackendRoute)
  @ApiOperation({ summary: 'RunQueriesDry', description: 'Dry-run queries' })
  @ApiOkResponse({ type: ToBackendRunQueriesDryResponseDto })
  async runQueriesDry(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendRunQueriesDryRequestDto
  ): Promise<BackendResultForOperation<'runQueriesDry'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        mconfigIds: body.input.mconfigIds,
        dryId: body.input.dryId,
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
            modelId: mconfig.modelId, // for chart as parent
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
        'runQueryDryOutputs',
        (v): Result.ResultAsync<RunQueryDryOutput[], RunQueryDryError> =>
          customAsyncPool({
            poolSize: 8,
            inputs: v.queryIds,
            callback: queryId =>
              this.runQueryDry({
                projectId: v.projectId,
                queryId: queryId
              })
          })
      ),
      Result.bind(
        'validEstimates',
        (v): Result.Result<QueryEstimate[], never> =>
          Result.succeed(
            v.runQueryDryOutputs
              .filter(x => isDefined(x.validEstimate))
              .map(x => x.validEstimate)
          )
      ),
      Result.bind(
        'errorQueries',
        (v): Result.Result<QueryTab[], never> =>
          Result.succeed(
            v.runQueryDryOutputs
              .filter(x => isDefined(x.errorQuery))
              .map(x => x.errorQuery)
          )
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async (): Promise<void> => {
            await retry(
              async () =>
                this.db.drizzle.transaction(async tx =>
                  this.db.packer.writeUnwrap({
                    tx: tx,
                    insertOrUpdate: { queries: v.errorQueries }
                  })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendRunQueriesDryOutput => ({
          dryId: v.dryId,
          errorQueries: v.errorQueries.map(x =>
            this.queriesService.tabToApi({ query: x })
          ),
          validQueryEstimates: v.validEstimates
        })
      )
    );
  }

  private async runQueryDry(item: {
    projectId: string;
    queryId: string;
  }): Result.ResultAsync<RunQueryDryOutput, RunQueryDryError> {
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
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsError> =>
          this.envsService.getApiEnvs({ projectId: v.projectId })
      ),
      Result.bind(
        'connection',
        async (
          v
        ): Result.ResultAsync<ConnectionTab, GetConnectionCheckExistsError> => {
          let apiEnv: Env = v.apiEnvs.find(x => x.envId === v.query.envId);

          let isFallbackConnection: boolean =
            apiEnv.isFallbackToProdConnections === true &&
            apiEnv.fallbackConnectionIds.includes(v.query.connectionId);

          return this.connectionsService.getConnectionCheckExists({
            projectId: v.query.projectId,
            envId: isFallbackConnection ? PROJECT_ENV_PROD : v.query.envId,
            connectionId: v.query.connectionId
          });
        }
      ),
      Result.andThen(
        (v): Result.ResultAsync<RunQueryDryOutput, never> =>
          this.bigqueryService
            .runQueryDry({ query: v.query, connection: v.connection })
            .then(x => Result.succeed(x))
      )
    );
  }
}
