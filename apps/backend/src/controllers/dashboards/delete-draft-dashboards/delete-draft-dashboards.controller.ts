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
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
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
      Result.bind('member', v =>
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
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
          projectId: v.projectId,
          envId: v.envId,
          member: v.member
        })
      ),
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
      Result.bind('struct', v =>
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
      Result.bind('apiUserMember', v =>
        Result.succeed(this.membersService.tabToApi({ member: v.member }))
      ),
      Result.bind('dashboardsCatalog', v =>
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
