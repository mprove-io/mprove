import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class GetProjectsListController {
  constructor(
    private membersRepository: repositories.MembersRepository,
    private projectsRepository: repositories.ProjectsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProjectsList)
  async getProjectsList(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetProjectsListRequest)
    reqValid: apiToBackend.ToBackendGetProjectsListRequest
  ) {
    let { orgId } = reqValid.payload;

    let userMembers = await this.membersRepository.find({
      member_id: user.user_id
    });

    let projectIds = userMembers.map(m => m.project_id);
    let projects =
      projectIds.length === 0
        ? []
        : await this.projectsRepository.find({
            project_id: In(projectIds),
            org_id: orgId
          });

    let sortedProjects = projects.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    let payload: apiToBackend.ToBackendGetProjectsListResponsePayload = {
      projectsList: sortedProjects.map(x => wrapper.wrapToApiProjectsItem(x))
    };

    return payload;
  }
}
