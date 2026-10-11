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
  ToBackendDeleteDashboardRequestDto,
  ToBackendDeleteDashboardResponseDto
} from '#backend/controllers/dashboards/delete-dashboard/delete-dashboard.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  DashboardTab,
  MemberTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import {
  type DashboardsCatalog,
  DashboardsService
} from '#backend/services/db/dashboards/dashboards.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetBranchCheckExistsResultError } from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetDashboardCheckExistsAndAccessResultError } from '#common/types/backend/function-errors/get-dashboard-check-exists-and-access-result-error';
import type { GetDashboardsCatalogResultError } from '#common/types/backend/function-errors/get-dashboards-catalog-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
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
    private branchesService: BranchesService,
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
    @Inject(DRIZZLE) private db: Db
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
        this.usersService.checkUserIsNotRestrictedResult({ user: v.user })
      ),
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
      Result.andThrough(v =>
        this.projectsService.checkProjectIsNotRestrictedResult({
          projectId: v.projectId,
          userMember: v.userMember,
          repoId: v.repoId
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
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsResultError> =>
          this.structsService.getStructCheckExistsResult({
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
          GetDashboardCheckExistsAndAccessResultError
        > =>
          this.dashboardsService.getDashboardCheckExistsAndAccessResult({
            structId: v.bridge.structId,
            dashboardId: v.dashboardId,
            userMember: v.userMember,
            user: v.user
          })
      ),
      Result.andThrough(v =>
        this.rpcService.sendToDiskResult({
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
        'branchBridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          this.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.branch.projectId),
                eq(bridgesTable.repoId, v.branch.repoId),
                eq(bridgesTable.branchId, v.branch.branchId)
              )
            })
            .then(xs => Result.succeed(xs))
      ),
      Result.map(v => {
        v.branchBridgeEnts.forEach(bridgeEnt => {
          if (bridgeEnt.envId !== v.envId) {
            bridgeEnt.structId = EMPTY_STRUCT_ID;

            bridgeEnt.needValidate = true;
          }
        });
        return v;
      }),
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

                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: { bridges: [...v.branchBridgeEnts] }
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
        (
          v
        ): Result.ResultAsync<
          DashboardsCatalog,
          GetDashboardsCatalogResultError
        > =>
          this.dashboardsService.getDashboardsCatalogResult({
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
