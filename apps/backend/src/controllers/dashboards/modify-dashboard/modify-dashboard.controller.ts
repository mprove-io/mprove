import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class ModifyDashboardController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private connection: Connection,
    private dashboardsService: DashboardsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendModifyDashboardRequest)
    reqValid: apiToBackend.ToBackendModifyDashboardRequest
  ) {
    let { traceId } = reqValid.info;
    let {
      projectId,
      isRepoProd,
      branchId,
      dashboardId,
      dashboardFileText
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.alias;

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

    let existingDashboard = await this.dashboardsService.getDashboardCheckExists(
      {
        structId: branch.struct_id,
        dashboardId: dashboardId
      }
    );

    if (member.is_editor === common.BoolEnum.FALSE) {
      this.dashboardsService.checkDashboardPath({
        userAlias: user.alias,
        filePath: existingDashboard.file_path
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
        fileNodeId: existingDashboard.file_path,
        userAlias: user.alias,
        content: dashboardFileText
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
      structId: branch.struct_id,
      diskFiles: diskResponse.payload.files,
      skipDb: true
    });

    let dashboard = dashboards.find(x => x.dashboardId === dashboardId);

    let dashboardMconfigIds = dashboard.reports.map(x => x.mconfigId);
    let dashboardMconfigs = mconfigs.filter(
      x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
    );

    let dashboardQueryIds = dashboard.reports.map(x => x.queryId);
    let dashboardQueries = queries.filter(
      x => dashboardQueryIds.indexOf(x.queryId) > -1
    );

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          mconfigs: dashboardMconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
          queries: dashboardQueries.map(x => wrapper.wrapToEntityQuery(x))
        }
      });
    });

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          dashboards: [wrapper.wrapToEntityDashboard(dashboard)],
          structs: [struct]
        }
      });
    });

    let payload = {};

    return payload;
  }
}
