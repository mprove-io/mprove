import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class SetProjectWeekStartController {
  constructor(
    private projectsService: ProjectsService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetProjectWeekStart)
  async setProjectWeekStart(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetProjectWeekStartRequest)
    reqValid: apiToBackend.ToBackendSetProjectWeekStartRequest
  ) {
    let { projectId, weekStart } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.projectsService.checkUserIsProjectAdmin({
      userId: user.user_id,
      projectId: projectId
    });

    project.week_start = weekStart;

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          projects: [project]
        }
      });
    });

    let payload: apiToBackend.ToBackendSetProjectWeekStartResponsePayload = {
      project: wrapper.wrapToApiProject(project)
    };

    return payload;
  }
}
