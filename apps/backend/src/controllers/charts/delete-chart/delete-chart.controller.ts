import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteChartRequestDto,
  ToBackendDeleteChartResponseDto
} from '#backend/controllers/charts/delete-chart/delete-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { ChartsService } from '#backend/services/db/charts/charts.service';
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
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteChartOutput } from '#common/types/backend/routes/charts/delete-chart/delete-chart-output';

@ApiTags('Charts')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteChartController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private rpcService: RpcService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private chartsService: ChartsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteChart' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteChart',
    description: 'Delete a saved chart'
  })
  @ApiOkResponse({
    type: ToBackendDeleteChartResponseDto
  })
  async deleteChart(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteChartRequestDto
  ): Promise<BackendResultForOperation<'deleteChart'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        branchId: body.input.branchId,
        envId: body.input.envId,
        chartId: body.input.chartId,
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
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
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
      Result.andThrough(v =>
        v.userMember.isExplorer === false
          ? Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_EXPLORER' })
          : Result.succeed()
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
          member: v.userMember
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
      Result.bind('existingChart', v =>
        this.chartsService.getChartCheckExists({
          structId: v.bridge.structId,
          chartId: v.chartId,
          userMember: v.userMember,
          user: v.user
        })
      ),
      Result.andThrough(v =>
        v.userMember.isAdmin === false && v.userMember.isEditor === false
          ? this.chartsService.checkChartPath({
              userAlias: v.user.alias,
              filePath: v.existingChart.filePath
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.rpcService.sendToDisk({
          request: {
            operation: 'deleteFile',
            traceId: v.traceId,
            input: {
              baseProject: projectTabToBaseProject({
                tabService: this.tabService,
                project: v.project
              }),
              repoId: v.repoId,
              branch: v.branchId,
              fileNodeId: v.existingChart.filePath,
              userAlias: v.user.alias
            }
          }
        })
      ),
      Result.bind('branchBridges', v =>
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
                    .delete(chartsTable)
                    .where(
                      and(
                        eq(chartsTable.chartId, v.chartId),
                        eq(chartsTable.structId, v.bridge.structId)
                      )
                    );

                  await this.db.txWriteUnwrap({
                    tx: tx,
                    insertOrUpdate: { bridges: [...v.branchBridges] }
                  });
                }),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.bind('apiUserMember', v =>
        Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind('models', v =>
        this.db.models.findMany({
          where: eq(modelsTable.structId, v.bridge.structId)
        })
      ),
      Result.bind('chartsCatalog', v =>
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
        (v): ToBackendDeleteChartOutput => ({
          chartUnitDrafts: v.chartsCatalog.chartUnitDrafts,
          chartSpaceNodes: v.chartsCatalog.chartSpaceNodes
        })
      )
    );
  }
}
