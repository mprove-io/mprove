import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { ChartsService } from '#backend/services/db/charts.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { UsersService } from '#backend/services/db/users.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { EMPTY_STRUCT_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { ToBackendDeleteChartRequest } from '#common/interfaces/to-backend/charts/to-backend-delete-chart';
import {
  ToDiskDeleteFileRequest,
  ToDiskDeleteFileResponse
} from '#common/interfaces/to-disk/07-files/to-disk-delete-file';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteChartController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private rpcService: RpcService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private chartsService: ChartsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteChart)
  async deleteChart(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteChartRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, envId, chartId } = reqValid.payload;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    await this.projectsService.checkProjectIsNotRestricted({
      projectId: projectId,
      userMember: userMember,
      repoId: repoId
    });

    if (userMember.isExplorer === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let existingChart = await this.chartsService.getChartCheckExists({
      structId: bridge.structId,
      chartId: chartId,
      userMember: userMember,
      user: user
    });

    await this.modelsService.getModelCheckExistsAndAccess({
      structId: bridge.structId,
      modelId: existingChart.modelId,
      userMember: userMember
    });

    if (userMember.isAdmin === false && userMember.isEditor === false) {
      this.chartsService.checkChartPath({
        userAlias: user.alias,
        filePath: existingChart.filePath
      });
    }

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskDeleteFileRequest: ToDiskDeleteFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingChart.filePath,
        userAlias: user.alias
      }
    };

    await this.rpcService.sendToDisk<ToDiskDeleteFileResponse>({
      orgId: project.orgId,
      projectId: projectId,
      repoId: repoId,
      message: toDiskDeleteFileRequest,
      checkIsOk: true
    });

    let branchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, branch.projectId),
        eq(bridgesTable.repoId, branch.repoId),
        eq(bridgesTable.branchId, branch.branchId)
      )
    });

    await forEachSeries(branchBridges, async x => {
      if (x.envId !== envId) {
        x.structId = EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(chartsTable)
            .where(
              and(
                eq(chartsTable.chartId, chartId),
                eq(chartsTable.structId, bridge.structId)
              )
            );

          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              bridges: [...branchBridges]
            }
          });
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
