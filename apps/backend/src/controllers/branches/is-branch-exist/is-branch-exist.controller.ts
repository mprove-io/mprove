import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class IsBranchExistController {
  constructor(
    private branchesRepository: repositories.BranchesRepository,
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsBranchExist)
  async isBranchExist(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendIsBranchExistRequest)
    reqValid: apiToBackend.ToBackendIsBranchExistRequest
  ) {
    let { projectId, branchId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberExists({
      memberId: user.user_id,
      projectId: projectId
    });

    let branch = await this.branchesRepository.findOne({
      project_id: projectId,
      repo_id: user.user_id,
      branch_id: branchId
    });

    let payload: apiToBackend.ToBackendIsBranchExistResponsePayload = {
      isExist: common.isDefined(branch)
    };

    return payload;
  }
}
