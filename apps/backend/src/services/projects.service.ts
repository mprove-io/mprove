import { Injectable } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';

@Injectable()
export class ProjectsService {
  constructor(private projectsRepository: repositories.ProjectsRepository) {}

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
}
