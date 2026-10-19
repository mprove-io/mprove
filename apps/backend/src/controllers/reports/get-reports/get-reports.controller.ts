import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetReportsRequestDto,
  ToBackendGetReportsResponseDto
} from '#backend/controllers/reports/get-reports/get-reports.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  ModelTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import {
  type ReportsCatalog,
  ReportsService
} from '#backend/services/db/reports/reports.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
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
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private modelsService: ModelsService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private reportsService: ReportsService,
    private db: DbService
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
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.db.members.findFirstCheckExists({
            where: and(
              eq(membersTable.memberId, v.user.userId),
              eq(membersTable.projectId, v.projectId)
            )
          })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.db.branches.findFirstCheckExists({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              eq(branchesTable.repoId, v.repoId),
              eq(branchesTable.branchId, v.branchId)
            )
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
          this.db.bridges.findFirstCheckExists({
            where: and(
              eq(bridgesTable.projectId, v.branch.projectId),
              eq(bridgesTable.repoId, v.branch.repoId),
              eq(bridgesTable.branchId, v.branch.branchId),
              eq(bridgesTable.envId, v.envId)
            )
          })
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
          this.db.models.findMany({
            where: and(
              inArray(modelsTable.modelId, v.modelIds),
              eq(modelsTable.structId, v.struct.structId)
            )
          })
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
          this.reportsService.getReportsCatalog({
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
