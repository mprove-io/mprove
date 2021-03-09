import { Controller, Post } from '@nestjs/common';
import { Connection, In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { ReposService } from '~backend/services/repos.service';

@Controller()
export class CreateTempDashboardController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private structsRepository: repositories.StructsRepository,
    private modelsRepository: repositories.ModelsRepository,
    private reposService: ReposService,
    private dashboardsService: DashboardsService,
    private connection: Connection
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
      repoId,
      branchId,
      oldDashboardId,
      newDashboardId,
      newDashboardFields
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    if (repoId !== common.PROD_REPO_ID) {
      await this.reposService.checkDevRepoId({
        userId: user.user_id,
        repoId: repoId
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let oldDashboard = await this.dashboardsService.getDashboardCheckExists({
      structId: branch.struct_id,
      dashboardId: oldDashboardId
    });

    let isAccessGranted = this.dashboardsService.checkDashboardAccess({
      userAlias: user.alias,
      memberRoles: member.roles,
      dashboard: oldDashboard
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    let struct = await this.structsRepository.findOne({
      struct_id: branch.struct_id
    });

    let modelIds = oldDashboard.reports.map(x => x.modelId);
    let models = await this.modelsRepository.find({
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

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          queries: queries.map(x => wrapper.wrapToEntityQuery(x)),
          mconfigs: mconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
          dashboards: [wrapper.wrapToEntityDashboard(newDashboard)]
        }
      });
    });

    let payload: apiToBackend.ToBackendCreateTempDashboardResponsePayload = {
      dashboard: newDashboard,
      dashboardMconfigs: mconfigs,
      dashboardQueries: queries
    };

    return payload;
  }
}
