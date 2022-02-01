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
import { DashboardsService } from '~backend/services/dashboards.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class CreateDashboardController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private dashboardsService: DashboardsService,
    private blockmlService: BlockmlService,
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDashboard)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateDashboardRequest)
    reqValid: apiToBackend.ToBackendCreateDashboardRequest
  ) {
    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
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

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let firstProjectId = this.cs.get<interfaces.Config['firstProjectId']>(
      'firstProjectId'
    );

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId &&
      repoId === common.PROD_REPO_ID &&
      branchId === common.BRANCH_MASTER
    ) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let dashboardFileText: string;

    if (common.isDefined(fromDashboardId)) {
      let existingDashboard = await this.dashboardsService.getDashboardCheckExists(
        {
          structId: branch.struct_id,
          dashboardId: fromDashboardId
        }
      );

      let fromDashboard = await this.dashboardsService.getDashboardX({
        user: user,
        member: member,
        dashboard: existingDashboard,
        branch: branch
      });

      fromDashboard.reports.forEach(x => {
        let freshReport = reportsGrid.find(y => x.title === y.title);
        x.tileX = freshReport.tileX;
        x.tileY = freshReport.tileY;
        x.tileWidth = freshReport.tileWidth;
        x.tileHeight = freshReport.tileHeight;
      });

      dashboardFileText = makeDashboardFileText({
        dashboard: fromDashboard,
        newDashboardId: newDashboardId,
        newTitle: dashboardTitle,
        roles: accessRoles,
        users: accessUsers
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
        hidden: false,
        reports: [],
        author: undefined,
        canEditOrDeleteDashboard: true,
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
        users: accessUsers
      });
    }

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
        parentNodeId: `${projectId}/${common.FILES_USERS_FOLDER}/${user.alias}`,
        fileName: `${newDashboardId}.dashboard`,
        userAlias: user.alias,
        fileText: dashboardFileText
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskCreateFileRequest,
        checkIsOk: true
      }
    );

    let {
      dashboards,
      vizs,
      mconfigs,
      queries,
      models
    } = await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId: branch.struct_id,
      diskFiles: diskResponse.payload.files,
      skipDb: true
    });

    let dashboard = dashboards.find(x => x.dashboardId === newDashboardId);

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
