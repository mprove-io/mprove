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
  ToBackendDeleteChartRequestDto,
  ToBackendDeleteChartResponseDto
} from '#backend/controllers/charts/delete-chart/delete-chart.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  ChartTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type BridgeEnt,
  bridgesTable
} from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import {
  type ChartsCatalog,
  ChartsService
} from '#backend/services/db/charts/charts.service';
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
import type { GetChartCheckExistsResultError } from '#common/types/backend/function-errors/get-chart-check-exists-result-error';
import type { GetChartsCatalogResultError } from '#common/types/backend/function-errors/get-charts-catalog-result-error';
import type { GetMemberCheckExistsResultError } from '#common/types/backend/function-errors/get-member-check-exists-result-error';
import type { GetProjectCheckExistsResultError } from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { ModelEntToTabResultError } from '#common/types/backend/function-errors/model-ent-to-tab-result-error';
import type { Member } from '#common/types/backend/parts/member';
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
    private branchesService: BranchesService,
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
    @Inject(DRIZZLE) private db: Db
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
      Result.andThrough(v =>
        v.userMember.isExplorer === false
          ? Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_EXPLORER' })
          : Result.succeed()
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
        'existingChart',
        (v): Result.ResultAsync<ChartTab, GetChartCheckExistsResultError> =>
          this.chartsService.getChartCheckExistsResult({
            structId: v.bridge.structId,
            chartId: v.chartId,
            userMember: v.userMember,
            user: v.user
          })
      ),
      Result.andThrough(v =>
        v.userMember.isAdmin === false && v.userMember.isEditor === false
          ? this.chartsService.checkChartPathResult({
              userAlias: v.user.alias,
              filePath: v.existingChart.filePath
            })
          : Result.succeed()
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
              fileNodeId: v.existingChart.filePath,
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
                    .delete(chartsTable)
                    .where(
                      and(
                        eq(chartsTable.chartId, v.chartId),
                        eq(chartsTable.structId, v.bridge.structId)
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
        'models',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabResultError> =>
          this.db.drizzle.query.modelsTable
            .findMany({ where: eq(modelsTable.structId, v.bridge.structId) })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.modelEntToTabResult({ modelEnt: x })
              )
            )
      ),
      Result.bind(
        'chartsCatalog',
        (v): Result.ResultAsync<ChartsCatalog, GetChartsCatalogResultError> =>
          this.chartsService.getChartsCatalogResult({
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
