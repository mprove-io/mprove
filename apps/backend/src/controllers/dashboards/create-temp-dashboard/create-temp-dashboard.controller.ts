import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
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
export class CreateTempDashboardController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private dbService: DbService,
    private envsService: EnvsService,
    private bridgesService: BridgesService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempDashboard)
  async createTempDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateTempDashboardRequest)
    reqValid: apiToBackend.ToBackendCreateTempDashboardRequest
  ) {
    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      oldDashboardId,
      newDashboardId,
      newDashboardFields,
      reports
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExists({
      projectId: projectId,
      envId: envId
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let currentStruct = await this.structsService.getStructCheckExists({
      structId: bridge.struct_id
    });

    let fromDashboardEntity = await this.dashboardsService.getDashboardCheckExists(
      {
        structId: bridge.struct_id,
        dashboardId: oldDashboardId
      }
    );

    let fromDashboard = await this.dashboardsService.getDashboardXCheckAccess({
      user: user,
      member: member,
      dashboard: fromDashboardEntity,
      bridge: bridge
    });

    let zReports: common.ReportX[] = [];

    reports.forEach(freshReport => {
      let zReport = fromDashboard.reports.find(
        y => freshReport.title === y.title
      );

      zReport.tileX = freshReport.tileX;
      zReport.tileY = freshReport.tileY;
      zReport.tileWidth = freshReport.tileWidth;
      zReport.tileHeight = freshReport.tileHeight;

      zReport.listen = freshReport.listen;
      zReport.timezone = freshReport.timezone;

      zReports.push(zReport);
    });

    fromDashboard.reports = zReports;
    fromDashboard.fields = newDashboardFields;

    let dashboardFileText = makeDashboardFileText({
      dashboard: fromDashboard,
      newDashboardId: newDashboardId,
      newTitle: fromDashboard.title,
      roles: fromDashboard.accessRoles.join(', '),
      users: fromDashboard.accessUsers.join(', '),
      defaultTimezone: currentStruct.default_timezone
    });

    let getCatalogFilesRequest: apiToDisk.ToDiskGetCatalogFilesRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        remoteType: project.remote_type,
        gitUrl: project.git_url,
        privateKey: project.private_key,
        publicKey: project.public_key
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskGetCatalogFilesResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: getCatalogFilesRequest,
        checkIsOk: true
      }
    );

    // add dashboard file

    let fileName = `${newDashboardId}${common.FileExtensionEnum.Dashboard}`;

    let relativePath = `${common.FILES_USERS_FOLDER}/${user.alias}/${fileName}`;

    let fileNodeId = `${projectId}/${relativePath}`;

    let pathString = JSON.stringify(fileNodeId.split('/'));

    let fileId = common.MyRegex.replaceSlashesWithUnderscores(relativePath);

    let tempFile: common.DiskCatalogFile = {
      projectId: projectId,
      repoId: repoId,
      fileId: fileId,
      pathString: pathString,
      fileNodeId: fileNodeId,
      name: fileName,
      content: dashboardFileText
    };

    let diskFiles = [
      tempFile,
      ...diskResponse.payload.files.filter(x => {
        let ar = x.name.split('.');
        let ext = ar[ar.length - 1];
        let allow =
          [
            common.FileExtensionEnum.Viz,
            common.FileExtensionEnum.Dashboard
          ].indexOf(`.${ext}` as common.FileExtensionEnum) < 0;
        return allow;
      })
    ];

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
      diskFiles: diskFiles,
      skipDb: true,
      envId: envId
    });

    let newDashboard = dashboards.find(x => x.dashboardId === newDashboardId);

    if (common.isUndefined(newDashboard)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_CREATE_TEMP_DASHBOARD_FAIL,
        data: {
          structErrors: struct.errors
        }
      });
    }

    newDashboard.temp = true;

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
        dashboards: [wrapper.wrapToEntityDashboard(newDashboard)],
        mconfigs: dashboardMconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
        queries: dashboardQueries.map(x => wrapper.wrapToEntityQuery(x))
      }
    });

    let payload = {};

    return payload;
  }
}
