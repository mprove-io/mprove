import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class SetProjectInfoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private dbService: DbService
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

    await this.dbService.writeRecords({
      modify: true,
      records: {
        projects: [project]
      }
    });

    let payload: apiToBackend.ToBackendSetProjectInfoResponsePayload = {
      project: wrapper.wrapToApiProject(project)
    };

    return payload;
  }
}
