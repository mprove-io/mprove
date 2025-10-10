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
import { chartsTable } from '~backend/drizzle/postgres/schema/charts';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { ChartsService } from '~backend/services/charts.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  RESTRICTED_USER_ALIAS
} from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { ToBackendDeleteChartRequest } from '~common/interfaces/to-backend/charts/to-backend-delete-chart';
import {
  ToDiskDeleteFileRequest,
  ToDiskDeleteFileResponse
} from '~common/interfaces/to-disk/07-files/to-disk-delete-file';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteChartController {
  constructor(
    private wrapToApiService: WrapEnxToApiService,
    private mconfigsService: MconfigsService,
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private chartsService: ChartsService,
    private blockmlService: BlockmlService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteChart)
  async deleteChart(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteChartRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId, chartId } = reqValid.payload;

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

    let existingChart = await this.chartsService.getChartCheckExists({
      structId: bridge.structId,
      chartId: chartId
    });

    if (member.isAdmin === false && member.isEditor === false) {
      this.chartsService.checkChartPath({
        userAlias: user.alias,
        filePath: existingChart.filePath
      });
    }

    // let chartMconfig = await this.mconfigsService.getMconfigCheckExists({
    //   structId: bridge.structId,
    //   mconfigId: existingChart.tiles[0].mconfigId
    // });

    // let secondFileNodeId;

    // if (chartMconfig.modelType === ModelTypeEnum.Malloy) {
    //   let pathParts = existingChart.filePath.split('.');

    //   pathParts[pathParts.length - 1] =
    //     FileExtensionEnum.Malloy.slice(1);

    //   secondFileNodeId = pathParts.join('.');
    // }

    let apiProject = this.wrapToApiService.wrapToApiProject({
      project: project,
      isAddGitUrl: true,
      isAddPrivateKey: true,
      isAddPublicKey: true
    });

    let toDiskDeleteFileRequest: ToDiskDeleteFileRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: apiProject,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingChart.filePath,
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

    // let { struct } = await this.blockmlService.rebuildStruct({
    //   traceId: traceId,
    //   projectId: projectId,
    //   structId: bridge.structId,
    //   diskFiles: diskResponse.payload.files,
    //   mproveDir: diskResponse.payload.mproveDir,
    //   skipDb: true,
    //   envId: envId,
    //   overrideTimezone: undefined
    // });

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
              // structs: [struct],
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
