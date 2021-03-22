import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class SetProjectInfoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetProjectInfo)
  async setProjectInfo(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendSetProjectInfoRequest)
    reqValid: apiToBackend.ToBackendSetProjectInfoRequest
  ) {
    let { projectId, name } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      projectId: projectId,
      memberId: user.user_id
    });

    if (common.isDefined(name)) {
      project.name = name;
    }

    let records: interfaces.Records;
    await this.connection.transaction(async manager => {
      records = await db.modifyRecords({
        manager: manager,
        records: {
          projects: [project]
        }
      });
    });

    let payload: apiToBackend.ToBackendSetProjectInfoResponsePayload = {
      project: wrapper.wrapToApiProject(records.projects[0])
    };

    return payload;
  }
}
