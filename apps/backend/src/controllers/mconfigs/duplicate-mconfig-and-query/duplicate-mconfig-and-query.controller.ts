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
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDuplicateMconfigAndQueryRequestDto,
  ToBackendDuplicateMconfigAndQueryResponseDto
} from '#backend/controllers/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ParentService } from '#backend/services/parent/parent.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import {
  DEFAULT_PIVOT_COLUMNS_WIDTH,
  DEFAULT_PIVOT_FIRST_COLUMN_WIDTH
} from '#common/constants/mconfig-chart';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetMconfigCheckExistsResultError } from '#common/types/backend/function-errors/get-mconfig-check-exists-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetModelCheckExistsResultError } from '#common/types/backend/function-errors/get-model-check-exists-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { QueryEntToTabResultError } from '#common/types/backend/function-errors/query-ent-to-tab-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDuplicateMconfigAndQueryOutput } from '#common/types/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-output';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import { makeQueryId } from '#node-common/functions/make-query-id/make-query-id';

type DuplicatedMconfigAndQuery = {
  newMconfig: MconfigTab;
  newQuery: QueryTab;
};

@ApiTags('Mconfigs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DuplicateMconfigAndQueryController {
  constructor(
    private tabService: TabService,
    private parentService: ParentService,
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private sessionsService: SessionsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDuplicateMconfigAndQuery' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DuplicateMconfigAndQuery',
    description: 'Duplicate an mconfig and its associated query'
  })
  @ApiOkResponse({
    type: ToBackendDuplicateMconfigAndQueryResponseDto
  })
  async duplicateMconfigAndQuery(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDuplicateMconfigAndQueryRequestDto
  ): Promise<BackendResultForOperation<'duplicateMconfigAndQuery'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        oldMconfigId: body.input.oldMconfigId,
        setPivotDefaults: body.input.setPivotDefaults,
        user: user
      }),
      Result.andThrough(v =>
        this.sessionsService.checkRepoIdResult({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsResultError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsResultError> =>
          this.membersService.getMemberCheckExistsResult({
            projectId: v.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsResultError> =>
          this.branchesService.getBranchCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsResultError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'oldMconfig',
        (v): Result.ResultAsync<MconfigTab, GetMconfigCheckExistsResultError> =>
          this.mconfigsService.getMconfigCheckExistsResult({
            structId: v.bridge.structId,
            mconfigId: v.oldMconfigId
          })
      ),
      Result.andThrough(v =>
        this.structsService.getStructCheckExistsAndNotChangedResult({
          projectId: v.projectId,
          bridgeStructId: v.bridge.structId,
          structId: v.oldMconfig.structId
        })
      ),
      Result.andThrough(v =>
        this.parentService.checkParentAccessResult({
          parentId: v.oldMconfig.parentId,
          parentType: v.oldMconfig.parentType,
          modelId: v.oldMconfig.modelId,
          user: v.user,
          userMember: v.userMember,
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      // Dashboard tiles and report metrics do not require model access here.
      Result.bind(
        'model',
        (v): Result.ResultAsync<ModelTab, GetModelCheckExistsResultError> =>
          this.modelsService.getModelCheckExistsResult({
            structId: v.bridge.structId,
            modelId: v.oldMconfig.modelId
          })
      ),
      Result.bind(
        'oldQuery',
        (v): Result.ResultAsync<QueryTab, QueryEntToTabResultError> =>
          this.db.drizzle.query.queriesTable
            .findFirst({
              where: and(
                eq(queriesTable.queryId, v.oldMconfig.queryId),
                eq(queriesTable.projectId, v.projectId)
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.queryEntToTabResult({ queryEnt: x })
            )
      ),
      Result.bind(
        'duplicated',
        (v): Result.Result<DuplicatedMconfigAndQuery, never> => {
          let newMconfigId: string = makeId();

          let newMconfigParentType: MconfigParentType =
            v.oldMconfig.parentType === 'Dashboard'
              ? 'ChartDialogDashboard'
              : v.oldMconfig.parentType === 'Report'
                ? 'ChartDialogReport'
                : v.oldMconfig.parentType;

          let newQueryId: string = makeQueryId({
            projectId: v.project.projectId,
            connectionId: v.model.connectionId,
            envId: v.envId,
            mconfigParentType: newMconfigParentType,
            mconfigParentId: v.oldMconfig.parentId,
            sql: v.oldQuery.sql,
            store: v.model.storeContent,
            storeTransformedRequestString: v.oldMconfig.storePart?.reqJsonParts
          });

          let chart: MconfigChart =
            v.setPivotDefaults === true
              ? {
                  ...v.oldMconfig.chart,
                  firstColumnWidth: DEFAULT_PIVOT_FIRST_COLUMN_WIDTH,
                  valueColumnsWidth: DEFAULT_PIVOT_COLUMNS_WIDTH
                }
              : v.oldMconfig.chart;

          let newMconfig: MconfigTab = {
            ...v.oldMconfig,
            mconfigId: newMconfigId,
            queryId: newQueryId,
            parentType: newMconfigParentType,
            chart: chart
          };

          let newQuery: QueryTab = { ...v.oldQuery, queryId: newQueryId };

          return Result.succeed({ newMconfig: newMconfig, newQuery: newQuery });
        }
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insert: {
                        mconfigs: [v.duplicated.newMconfig]
                      },
                      insertOrUpdate: {
                        queries: [v.duplicated.newQuery]
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendDuplicateMconfigAndQueryOutput => ({
          mconfig: this.mconfigsService.tabToApi({
            mconfig: v.duplicated.newMconfig,
            modelFields: v.model.fields
          }),
          query: this.queriesService.tabToApi({ query: v.duplicated.newQuery })
        })
      )
    );
  }
}
