import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetReportsRequestDto,
  ToBackendGetReportsResponseDto
} from '#backend/controllers/reports/get-reports/get-reports.dto';
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
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import {
  type ReportsCatalog,
  ReportsService
} from '#backend/services/db/reports/reports.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetReportsCatalogError } from '#common/types/backend/function-errors/get-reports-catalog-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetReportsOutput } from '#common/types/backend/routes/reports/get-reports/get-reports-output';

@ApiTags('Reports')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetReportsController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private reportsService: ReportsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGetReports' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetReports',
    description: 'List reports'
  })
  @ApiOkResponse({
    type: ToBackendGetReportsResponseDto
  })
  async getReports(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetReportsRequestDto
  ): Promise<BackendResultForOperation<'getReports'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
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
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
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
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
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
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'modelIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.struct.metrics
              .filter(m => isDefined(m.modelId))
              .map(x => x.modelId)
          )
      ),
      Result.bind(
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.drizzle.query.modelsTable
            .findMany({
              where: and(
                inArray(modelsTable.modelId, v.modelIds),
                eq(modelsTable.structId, v.struct.structId)
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.modelEntToTabResult({ modelEnt: x })
              )
            )
      ),
      Result.bind(
        'apiModels',
        (v): Result.Result<ModelX[], never> =>
          Result.succeed(
            v.models.map(model =>
              this.modelsService.tabToApi({
                model: model,
                hasAccess: checkModelAccess({
                  member: v.userMember,
                  modelAccessRoles: model.accessRolesCombined
                })
              })
            )
          )
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'reportsCatalog',
        (v): Result.ResultAsync<ReportsCatalog, GetReportsCatalogError> =>
          this.reportsService.getReportsCatalogResult({
            projectId: v.projectId,
            structId: v.bridge.structId,
            user: v.user,
            userMember: v.userMember,
            apiUserMember: v.apiUserMember,
            spaces: v.struct.spaces
          })
      ),
      Result.map(
        (v): ToBackendGetReportsOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.apiModels
          }),
          userMember: v.apiUserMember,
          reportUnitDrafts: v.reportsCatalog.reportUnitDrafts,
          reportSpaceNodes: v.reportsCatalog.reportSpaceNodes,
          storeModels: v.apiModels.filter(model => model.type === 'Store')
        })
      )
    );
  }
}
