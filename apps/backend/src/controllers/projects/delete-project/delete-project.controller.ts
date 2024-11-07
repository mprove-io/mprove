import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteProjectController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private projectsRepository: repositories.ProjectsRepository,
    private membersRepository: repositories.MembersRepository,
    private branchesRepository: repositories.BranchesRepository,
    private bridgesRepository: repositories.BridgesRepository,
    private envsRepository: repositories.EnvsRepository,
    private evsRepository: repositories.EvsRepository,
    private connectionsRepository: repositories.ConnectionsRepository,
    private rabbitService: RabbitService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteProject)
  async deleteProject(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteProjectRequest = request.body;

    let { projectId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      projectId: projectId,
      memberId: user.user_id
    });

    let toDiskDeleteProjectRequest: apiToDisk.ToDiskDeleteProjectRequest = {
      info: {
        name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskDeleteProject,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.org_id,
        projectId: projectId
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<apiToDisk.ToDiskDeleteProjectResponse>(
        {
          routingKey: helper.makeRoutingKeyToDisk({
            orgId: project.org_id,
            projectId: projectId
          }),
          message: toDiskDeleteProjectRequest,
          checkIsOk: true
        }
      );

    await this.projectsRepository.delete({ project_id: projectId });
    await this.membersRepository.delete({ project_id: projectId });
    await this.connectionsRepository.delete({ project_id: projectId });
    await this.envsRepository.delete({ project_id: projectId });
    await this.evsRepository.delete({ project_id: projectId });
    await this.branchesRepository.delete({ project_id: projectId });
    await this.bridgesRepository.delete({ project_id: projectId });

    let payload = {};

    return payload;
  }
}
