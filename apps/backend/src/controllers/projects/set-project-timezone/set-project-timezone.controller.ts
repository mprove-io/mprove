import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class SetProjectTimezoneController {
  constructor(
    private projectsService: ProjectsService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetProjectTimezone)
  async setProjectTimezone(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetProjectTimezoneRequest)
    reqValid: apiToBackend.ToBackendSetProjectTimezoneRequest
  ) {
    let { projectId, timezone } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.projectsService.checkUserIsProjectAdmin({
      userId: user.user_id,
      projectId: projectId
    });

    project.timezone = timezone;

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          projects: [project]
        }
      });
    });

    let payload: apiToBackend.ToBackendSetProjectTimezoneResponsePayload = {
      project: wrapper.wrapToApiProject(project)
    };

    return payload;
  }
}
