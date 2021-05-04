import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/branches.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@Controller()
export class DeleteDashboardController {
  constructor(
    private branchesService: BranchesService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private blockmlService: BlockmlService,
    private dbService: DbService,
    private dashboardsService: DashboardsService,
    private dashboardsRepository: repositories.DashboardsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteDashboard)
  async createEmptyDashboard(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendDeleteDashboardRequest)
    reqValid: apiToBackend.ToBackendDeleteDashboardRequest
  ) {
    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, dashboardId } = reqValid.payload;

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

    let toDiskDeleteFileRequest: apiToDisk.ToDiskDeleteFileRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteFile,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        fileNodeId: existingDashboard.file_path,
        userAlias: user.alias
      }
    };

    let diskResponse = await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteFileResponse>(
      {
        routingKey: helper.makeRoutingKeyToDisk({
          orgId: project.org_id,
          projectId: projectId
        }),
        message: toDiskDeleteFileRequest,
        checkIsOk: true
      }
    );

    let { struct } = await this.blockmlService.rebuildStruct({
      traceId,
      orgId: project.org_id,
      projectId,
      structId: branch.struct_id,
      diskFiles: diskResponse.payload.files,
      skipDb: true
    });

    await this.dashboardsRepository.delete({
      dashboard_id: dashboardId,
      struct_id: branch.struct_id
    });

    await this.dbService.writeRecords({
      modify: true,
      records: {
        structs: [struct]
      }
    });

    let payload = {};

    return payload;
  }
}
