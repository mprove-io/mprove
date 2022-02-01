import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { DbService } from '~backend/services/db.service';
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
    private structsService: StructsService,
    private modelsRepository: repositories.ModelsRepository,
    private dashboardsService: DashboardsService,
    private dbService: DbService
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

    let oldDashboard = await this.dashboardsService.getDashboardCheckExists({
      structId: branch.struct_id,
      dashboardId: oldDashboardId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      vmd: oldDashboard
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let struct = await this.structsService.getStructCheckExists({
      structId: branch.struct_id
    });

    //

    oldDashboard.content.reports = oldDashboard.content.reports.filter(
      (x: any) => reports.findIndex(y => y.title === x.title) > -1
    );

    oldDashboard.content.reports.forEach((x: any) => {
      let freshReport = reports.find(y => x.title === y.title);
      x.tile = {};
      x.tile.tile_x = `${freshReport.tileX}`;
      x.tile.tile_y = `${freshReport.tileY}`;
      x.tile.tile_width = `${freshReport.tileWidth}`;
      x.tile.tile_height = `${freshReport.tileHeight}`;
      x.listen = common.isDefined(freshReport.listen) ? freshReport.listen : {};
    });

    let oldReports: any[] = [];

    reports.forEach(z => {
      let oldReport = oldDashboard.content.reports.find(
        (y: any) => z.title === y.title
      );
      oldReports.push(oldReport);
    });

    oldDashboard.content.reports = oldReports;

    //

    let modelIds = oldDashboard.reports.map(x => x.modelId);
    let models =
      modelIds.length === 0
        ? []
        : await this.modelsRepository.find({
            struct_id: branch.struct_id,
            model_id: In(modelIds)
          });

    let toBlockmlProcessDashboardRequest: apiToBlockml.ToBlockmlProcessDashboardRequest = {
      info: {
        name:
          apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlProcessDashboard,
        traceId: traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        structId: branch.struct_id,
        weekStart: struct.week_start,
        udfsDict: struct.udfs_dict,
        modelContents: models.map(x => x.content),
        dashboardContent: oldDashboard.content,
        newDashboardId: newDashboardId,
        newDashboardFields: newDashboardFields
      }
    };

    let blockmlProcessDashboardResponse = await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlProcessDashboardResponse>(
      {
        routingKey: common.RabbitBlockmlRoutingEnum.ProcessDashboard.toString(),
        message: toBlockmlProcessDashboardRequest,
        checkIsOk: true
      }
    );

    let newDashboard = blockmlProcessDashboardResponse.payload.dashboard;
    let mconfigs = blockmlProcessDashboardResponse.payload.mconfigs;
    let queries = blockmlProcessDashboardResponse.payload.queries;

    await this.dbService.writeRecords({
      modify: false,
      records: {
        queries: queries.map(x => wrapper.wrapToEntityQuery(x)),
        mconfigs: mconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
        dashboards: [wrapper.wrapToEntityDashboard(newDashboard)]
      }
    });

    let payload = {};

    return payload;
  }
}
