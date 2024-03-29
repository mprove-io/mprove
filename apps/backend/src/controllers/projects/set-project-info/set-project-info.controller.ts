import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
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
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSetProjectInfoRequest = request.body;

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
