import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteDraftDashboardsRequestDto,
  ToBackendDeleteDraftDashboardsResponseDto
} from '#backend/controllers/dashboards/delete-draft-dashboards/delete-draft-dashboards.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  MemberTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import {
  type DashboardsCatalog,
  DashboardsService
} from '#backend/services/db/dashboards/dashboards.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetDashboardsCatalogError } from '#common/types/backend/function-errors/get-dashboards-catalog-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteDraftDashboardsOutput } from '#common/types/backend/routes/dashboards/delete-draft-dashboards/delete-draft-dashboards-output';

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteDraftDashboardsController {
  constructor(
    private usersService: UsersService,
    private dashboardsService: DashboardsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private structsService: StructsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteDraftDashboards' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteDraftDashboards',
    description: "Delete the current user's draft dashboards"
  })
  @ApiOkResponse({
    type: ToBackendDeleteDraftDashboardsResponseDto
  })
  async createEmptyDashboard(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteDraftDashboardsRequestDto
  ): Promise<BackendResultForOperation<'deleteDraftDashboards'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        dashboardIds: body.input.dashboardIds,
        user: user
      }),
      Result.andThrough(v =>
        this.usersService.checkUserIsNotRestricted({ user: v.user })
      ),
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
        'member',
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
          member: v.member
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
      Result.andThrough(async v => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(async tx => {
              await tx
                .delete(dashboardsTable)
                .where(
                  and(
                    inArray(dashboardsTable.dashboardId, v.dashboardIds),
                    eq(dashboardsTable.draft, true),
                    eq(dashboardsTable.creatorId, v.user.userId),
                    eq(dashboardsTable.structId, v.bridge.structId)
                  )
                );
            }),
          getRetryOption(this.cs, this.logger)
        );
        return Result.succeed();
      }),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.member }))
      ),
      Result.bind(
        'dashboardsCatalog',
        (v): Result.ResultAsync<DashboardsCatalog, GetDashboardsCatalogError> =>
          this.dashboardsService.getDashboardsCatalog({
            projectId: v.projectId,
            structId: v.bridge.structId,
            user: v.user,
            apiUserMember: v.apiUserMember,
            spaces: v.struct.spaces
          })
      ),
      Result.map(
        (v): ToBackendDeleteDraftDashboardsOutput => ({
          dashboardUnitDrafts: v.dashboardsCatalog.dashboardUnitDrafts
        })
      )
    );
  }
}
