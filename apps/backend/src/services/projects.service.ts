import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class ProjectsService {
  constructor(
    private projectsRepository: repositories.ProjectsRepository,
    private membersRepository: repositories.MembersRepository
  ) {}

  async getProjectCheckExists(item: { projectId: string }) {
    let { projectId } = item;

    let project = await this.projectsRepository.findOne({
      project_id: projectId
    });

    if (common.isUndefined(project)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_PROJECT_DOES_NOT_EXIST
      });
    }

    return project;
  }

  async checkUserIsProjectAdmin(item: { userId: string; projectId: string }) {
    let { projectId, userId } = item;

    let member = await this.membersRepository.findOne({
      member_id: userId,
      project_id: projectId
    });

    if (member.is_admin !== common.BoolEnum.TRUE) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_PROJECT
      });
    }

    return;
  }

  async checkUserIsProjectMember(item: { userId: string; projectId: string }) {
    let { projectId, userId } = item;

    let member = await this.membersRepository.findOne({
      member_id: userId,
      project_id: projectId
    });

    if (common.isUndefined(member)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_PROJECT
      });
    }

    return;
  }
}
