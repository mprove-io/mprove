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
import { and, eq } from 'drizzle-orm';
import { forEachSeries } from 'p-iteration';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { dashboardsTable } from '~backend/drizzle/postgres/schema/dashboards';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { DashboardsService } from '~backend/services/db/dashboards.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { TabService } from '~backend/services/tab.service';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  RESTRICTED_USER_ALIAS
} from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { ToBackendDeleteDashboardRequest } from '~common/interfaces/to-backend/dashboards/to-backend-delete-dashboard';
import {
  ToDiskDeleteFileRequest,
  ToDiskDeleteFileResponse
} from '~common/interfaces/to-disk/07-files/to-disk-delete-file';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteDashboardController {
  constructor(
    private tabService: TabService,
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteDashboard)
  async createEmptyDashboard(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteDashboardRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId, dashboardId } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (
      member.isAdmin === false &&
      projectId === demoProjectId &&
      repoId === PROD_REPO_ID
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let existingDashboard =
      await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.structId,
        dashboardId: dashboardId
      });

    if (member.isAdmin === false && member.isEditor === false) {
      this.dashboardsService.checkDashboardPath({
        userAlias: user.alias,
        filePath: existingDashboard.filePath
      });
    }

    // let secondFileNodeId;

    // let mconfigIds = existingDashboard.tiles.map(x => x.mconfigId);
    // let mconfigs =
    //   mconfigIds.length === 0
    //     ? []
    //     : await this.db.drizzle.query.mconfigsTable.findMany({
    //         where: inArray(mconfigsTable.mconfigId, mconfigIds)
    //       });

    // if (mconfigs.some(x => x.modelType === ModelTypeEnum.Malloy)) {
    //   let pathParts = existingDashboard.filePath.split('.');

    //   pathParts[pathParts.length - 1] =
    //     FileExtensionEnum.Malloy.slice(1);

    //   secondFileNodeId = pathParts.join('.');
    // }

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
        fileNodeId: existingDashboard.filePath,
        userAlias: user.alias
        // secondFileNodeId: secondFileNodeId,
      }
    };

    await this.rabbitService.sendToDisk<ToDiskDeleteFileResponse>({
      routingKey: makeRoutingKeyToDisk({
        orgId: project.orgId,
        projectId: projectId
      }),
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
            .delete(dashboardsTable)
            .where(
              and(
                eq(dashboardsTable.dashboardId, dashboardId),
                eq(dashboardsTable.structId, bridge.structId)
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
