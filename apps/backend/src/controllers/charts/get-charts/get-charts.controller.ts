import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetChartsRequestDto,
  ToBackendGetChartsResponseDto
} from '#backend/controllers/charts/get-charts/get-charts.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ModelTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import {
  type ChartsCatalog,
  ChartsService
} from '#backend/services/db/charts/charts.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetChartsCatalogError } from '#common/types/backend/function-errors/get-charts-catalog-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetChartsOutput } from '#common/types/backend/routes/charts/get-charts/get-charts-output';

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetChartsController {
  constructor(
    private tabService: TabService,
    private chartsService: ChartsService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGetCharts' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetCharts',
    description: 'List charts the user can access'
  })
  @ApiOkResponse({
    type: ToBackendGetChartsResponseDto
  })
  async getCharts(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetChartsRequestDto
  ): Promise<BackendResultForOperation<'getCharts'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
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
      Result.andThrough(v =>
        v.userMember.isExplorer === false
          ? Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_EXPLORER' })
          : Result.succeed()
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
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.drizzle.query.modelsTable
            .findMany({ where: eq(modelsTable.structId, v.bridge.structId) })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.modelEntToTab({ modelEnt: x })
              )
            )
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExists({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'apiModels',
        (v): Result.Result<ModelX[], never> =>
          Result.succeed(
            v.models
              .map(model =>
                this.modelsService.tabToApi({
                  model: model,
                  hasAccess: checkModelAccess({
                    member: v.userMember,
                    modelAccessRoles: model.accessRolesCombined
                  })
                })
              )
              .sort((a, b) =>
                a.label > b.label ? 1 : b.label > a.label ? -1 : 0
              )
          )
      ),
      Result.bind(
        'chartsCatalog',
        (v): Result.ResultAsync<ChartsCatalog, GetChartsCatalogError> =>
          this.chartsService.getChartsCatalog({
            projectId: v.projectId,
            structId: v.bridge.structId,
            user: v.user,
            apiUserMember: v.apiUserMember,
            models: v.models,
            spaces: v.struct.spaces
          })
      ),
      Result.map(
        (v): ToBackendGetChartsOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.apiModels
          }),
          userMember: v.apiUserMember,
          models: v.apiModels,
          chartUnitDrafts: v.chartsCatalog.chartUnitDrafts,
          chartSpaceNodes: v.chartsCatalog.chartSpaceNodes
        })
      )
    );
  }
}
