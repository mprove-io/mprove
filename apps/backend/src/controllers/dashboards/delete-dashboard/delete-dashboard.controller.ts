import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteDashboardRequestDto,
  ToBackendDeleteDashboardResponseDto
} from '#backend/controllers/dashboards/delete-dashboard/delete-dashboard.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  BridgeTab,
  DashboardTab,
  MemberTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import {
  type DashboardsCatalog,
  DashboardsService
} from '#backend/services/db/dashboards/dashboards.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetBranchBridgesForRebuildError } from '#common/types/backend/function-errors/get-branch-bridges-for-rebuild-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetDashboardCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-error';
import type { GetDashboardsCatalogError } from '#common/types/backend/function-errors/get-dashboards-catalog-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteDashboardOutput } from '#common/types/backend/routes/dashboards/delete-dashboard/delete-dashboard-output';

@ApiTags('Dashboards')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteDashboardController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private rpcService: RpcService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private dashboardsService: DashboardsService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteDashboard' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteDashboard',
    description: 'Delete a dashboard'
  })
  @ApiOkResponse({
    type: ToBackendDeleteDashboardResponseDto
  })
  async createEmptyDashboard(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteDashboardRequestDto
  ): Promise<BackendResultForOperation<'deleteDashboard'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        dashboardId: body.input.dashboardId,
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
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
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
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestricted({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId
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
        'existingDashboard',
        (
          v
        ): Result.ResultAsync<
          DashboardTab,
          GetDashboardCheckExistsAndAccessError
        > =>
          this.dashboardsService.getDashboardCheckExistsAndAccess({
            structId: v.bridge.structId,
            dashboardId: v.dashboardId,
            userMember: v.userMember,
            user: v.user
          })
      ),
      Result.andThrough(v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'deleteFile',
            traceId: v.traceId,
            input: {
              baseProject: this.tabService.projectTabToBaseProject({
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              fileNodeId: v.existingDashboard.filePath,
              userAlias: v.user.alias
            }
          }
        })
      ),
      Result.bind(
        'branchBridges',
        (v): Result.ResultAsync<BridgeTab[], GetBranchBridgesForRebuildError> =>
          this.bridgesService.getBranchBridgesForRebuild({
            projectId: v.branch.projectId,
            repoId: v.branch.repoId,
            branchId: v.branch.branchId,
            envId: v.envId
          })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(async tx => {
                  await tx
                    .delete(dashboardsTable)
                    .where(
                      and(
                        eq(dashboardsTable.dashboardId, v.dashboardId),
                        eq(dashboardsTable.structId, v.bridge.structId)
                      )
                    );

                  await this.db.packer.writeUnwrap({
                    tx: tx,
                    insertOrUpdate: { bridges: [...v.branchBridges] }
                  });
                }),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
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
        (v): ToBackendDeleteDashboardOutput => ({
          dashboardUnitDrafts: v.dashboardsCatalog.dashboardUnitDrafts,
          dashboardSpaceNodes: v.dashboardsCatalog.dashboardSpaceNodes
        })
      )
    );
  }
}
