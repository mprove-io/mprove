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
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class CreateDashboardController {
  constructor(
    private branchesService: BranchesService,
    private structsService: StructsService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private blockmlService: BlockmlService,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>,
    private envsService: EnvsService,
    private bridgesService: BridgesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDashboard)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateDashboardRequest)
    reqValid: apiToBackend.ToBackendCreateDashboardRequest
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
      newDashboardId,
      fromDashboardId,
      dashboardTitle,
      accessUsers,
      accessRoles,
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

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let dashboardFileText: string;

    if (common.isDefined(fromDashboardId)) {
      let fromDashboardEntity =
        await this.dashboardsService.getDashboardCheckExists({
          structId: bridge.struct_id,
          dashboardId: fromDashboardId
        });

      let fromDashboard = await this.dashboardsService.getDashboardXCheckAccess(
        {
          user: user,
          member: member,
          dashboard: fromDashboardEntity,
          bridge: bridge
        }
      );

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
        newDashboardId: newDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        users: accessUsers,
        defaultTimezone: currentStruct.default_timezone
      });
    } else {
      let newDashboard: common.DashboardX = {
        structId: undefined,
        dashboardId: newDashboardId,
        filePath: undefined,
        content: undefined,
        accessUsers: undefined,
        accessRoles: undefined,
        title: undefined,
        hidden: undefined,
        reports: [],
        author: undefined,
        canEditOrDeleteDashboard: undefined,
        serverTs: undefined,
        extendedFilters: [],
        fields: [],
        temp: false
      };

      dashboardFileText = makeDashboardFileText({
        dashboard: newDashboard,
        newDashboardId: newDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        users: accessUsers,
        defaultTimezone: currentStruct.default_timezone
      });
    }

    let mdir = currentStruct.mprove_dir_value;

    if (
      mdir.length > 2 &&
      mdir.substring(0, 2) === common.MPROVE_CONFIG_DIR_DOT_SLASH
    ) {
      mdir = mdir.substring(2);
    }

    let parentNodeId =
      [
        common.MPROVE_CONFIG_DIR_DOT,
        common.MPROVE_CONFIG_DIR_DOT_SLASH
      ].indexOf(currentStruct.mprove_dir_value) > -1
        ? `${projectId}/${common.MPROVE_USERS_FOLDER}/${user.alias}`
        : `${projectId}/${mdir}/${common.MPROVE_USERS_FOLDER}/${user.alias}`;

    let fileName = `${newDashboardId}${common.FileExtensionEnum.Dashboard}`;

    let toDiskCreateFileRequest: apiToDisk.ToDiskCreateFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        parentNodeId: parentNodeId,
        fileName: fileName,
        userAlias: user.alias,
        fileText: dashboardFileText,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>({
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
        checkIsOk: true
      });

    let { dashboards, vizs, mconfigs, queries, models, struct } =
      await this.blockmlService.rebuildStruct({
        traceId,
        orgId: project.org_id,
        projectId,
        structId: bridge.struct_id,
        diskFiles: diskResponse.payload.files,
        mproveDir: diskResponse.payload.mproveDir,
        skipDb: true,
        envId: envId
      });

    let dashboard = dashboards.find(x => x.dashboardId === newDashboardId);

    await this.dbService.writeRecords({
      modify: true,
      records: {
        structs: [struct]
      }
    });

    if (common.isUndefined(dashboard)) {
      let fileId = `${parentNodeId}/${fileName}`;
      let fileIdAr = fileId.split('/');
      fileIdAr.shift();
      let underscoreFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CREATE_DASHBOARD_FAIL,
        data: {
          underscoreFileId: underscoreFileId
        }
      });
    }

    let dashboardMconfigIds = dashboard.reports.map(x => x.mconfigId);
    let dashboardMconfigs = mconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = dashboard.reports.map(x => x.queryId);
    let dashboardQueries = queries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    await this.dbService.writeRecords({
      modify: false,
      records: {
        dashboards: [wrapper.wrapToEntityDashboard(dashboard)],
        mconfigs: dashboardMconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
        queries: dashboardQueries.map(x => wrapper.wrapToEntityQuery(x))
      }
    });

    let payload = {};

    return payload;
  }
}
