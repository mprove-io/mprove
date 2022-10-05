import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { makeDashboardFileText } from '~backend/functions/make-dashboard-file-text';
import { DashboardsRepository } from '~backend/models/store-repositories/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class ModifyDashboardController {
  constructor(
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private modelsService: ModelsService,
    private dashboardsRepository: DashboardsRepository,
    private dbService: DbService,
    private dashboardsService: DashboardsService,
    private cs: ConfigService<interfaces.Config>,
    private envsService: EnvsService,
    private bridgesService: BridgesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendModifyDashboardRequest)
    reqValid: apiToBackend.ToBackendModifyDashboardRequest
  ) {
    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      toDashboardId,
      fromDashboardId,
      selectedReportTitle,
      newReport,
      isReplaceReport,
      accessUsers,
      accessRoles,
      dashboardTitle,
      reportsGrid
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    if (member.is_explorer === common.BoolEnum.FALSE) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
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
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let firstProjectId = this.cs.get<interfaces.Config['firstProjectId']>(
      'firstProjectId'
    );

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let fromDashboardEntity = await this.dashboardsService.getDashboardCheckExists(
      {
        structId: bridge.struct_id,
        dashboardId: fromDashboardId
      }
    );

    let fromDashboard = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: member,
      dashboard: fromDashboardEntity,
      bridge: bridge
    });

    let toDashboardEntity = await this.dashboardsService.getDashboardCheckExists(
      {
        structId: bridge.struct_id,
        dashboardId: toDashboardId
      }
    );

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      member.is_editor === common.BoolEnum.FALSE
    ) {
      this.dashboardsService.checkDashboardPath({
        userAlias: user.alias,
        filePath: toDashboardEntity.file_path
      });
    }

    // let toDashboard = await this.dashboardsService.getDashboardXCheckAccess({
    //   user: user,
    //   member: member,
    //   dashboard: toDashboardEntity,
    //   bridge: bridge
    // });

    let dashboardFileText: string;

    if (common.isDefined(newReport)) {
      let mconfigModel = await this.modelsService.getModelCheckExists({
        structId: bridge.struct_id,
        modelId: newReport.mconfig.modelId
      });

      let isAccessGranted = helper.checkAccess({
        userAlias: user.alias,
        member: member,
        vmd: mconfigModel
      });

      if (isAccessGranted === false) {
        throw new common.ServerError({
          message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
        });
      }

      newReport.mconfig.chart.title = newReport.title;

      let tileY = 0;

      fromDashboard.reports.forEach(report => {
        tileY = tileY + report.tileHeight;
      });

      newReport.tileY = tileY;

      if (isReplaceReport === true) {
        let oldReportIndex = fromDashboard.reports.findIndex(
          x => x.title === selectedReportTitle
        );

        let oldReport = fromDashboard.reports[oldReportIndex];

        newReport.tileWidth = oldReport.tileWidth;
        newReport.tileHeight = oldReport.tileHeight;
        newReport.tileX = oldReport.tileX;
        newReport.tileY = oldReport.tileY;

        fromDashboard.reports[oldReportIndex] = newReport;
      } else {
        fromDashboard.reports = [...fromDashboard.reports, newReport];
      }

      dashboardFileText = makeDashboardFileText({
        dashboard: fromDashboard,
        newDashboardId: fromDashboard.dashboardId,
        newTitle: fromDashboard.title,
        roles: fromDashboard.accessRoles.join(', '),
        users: fromDashboard.accessUsers.join(', '),
        defaultTimezone: currentStruct.default_timezone
      });
    } else {
      // dashboard save as - replace existing
      let zReports: common.ReportX[] = [];

      reportsGrid.forEach(freshReport => {
        let zReport = fromDashboard.reports.find(
          y => freshReport.title === y.title
        );

        zReport.tileX = freshReport.tileX;
        zReport.tileY = freshReport.tileY;
        zReport.tileWidth = freshReport.tileWidth;
        zReport.tileHeight = freshReport.tileHeight;

        zReports.push(zReport);
      });

      fromDashboard.reports = zReports;

      dashboardFileText = makeDashboardFileText({
        dashboard: fromDashboard,
        newDashboardId: toDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        users: accessUsers,
        defaultTimezone: currentStruct.default_timezone
      });
    }

    let toDiskSaveFileRequest: apiToDisk.ToDiskSaveFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: toDashboardEntity.file_path,
        userAlias: user.alias,
        content: dashboardFileText,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskSaveFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskSaveFileRequest,
        checkIsOk: true
      }
    );

    let {
      struct,
      dashboards,
      vizs,
      mconfigs,
      queries,
      models
    } = await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId: bridge.struct_id,
      diskFiles: diskResponse.payload.files,
      mproveDir: diskResponse.payload.mproveDir,
      skipDb: true,
      envId: envId
    });

    let newDashboard = dashboards.find(x => x.dashboardId === toDashboardId);

    await this.dbService.writeRecords({
      modify: true,
      records: {
        dashboards: common.isDefined(newDashboard)
          ? [wrapper.wrapToEntityDashboard(newDashboard)]
          : undefined,
        structs: [struct]
      }
    });

    if (common.isUndefined(newDashboard)) {
      await this.dashboardsRepository.delete({
        dashboard_id: toDashboardId,
        struct_id: bridge.struct_id
      });

      let fileIdAr = toDashboardEntity.file_path.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MODIFY_DASHBOARD_FAIL,
        data: {
          underscoreFileId: underscoreFileId
        }
      });
    }

    let dashboardMconfigIds = newDashboard.reports.map(x => x.mconfigId);
    let dashboardMconfigs = mconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = newDashboard.reports.map(x => x.queryId);
    let dashboardQueries = queries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    await this.dbService.writeRecords({
      modify: false,
      records: {
        mconfigs: dashboardMconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
        queries: dashboardQueries.map(x => wrapper.wrapToEntityQuery(x))
      }
    });

    let payload = {};

    return payload;
  }
}
