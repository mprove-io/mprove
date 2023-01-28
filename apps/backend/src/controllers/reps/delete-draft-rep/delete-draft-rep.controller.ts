import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteDraftRepController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private repsRepository: repositories.RepsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteDraftRep)
  async getModels(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteDraftRepRequest = request.body;

    let { projectId, repId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    await this.repsRepository.delete({
      rep_id: repId,
      project_id: projectId,
      draft: common.BoolEnum.TRUE,
      creator_id: user.user_id
    });

    let payload = {};

    return payload;
  }
}
