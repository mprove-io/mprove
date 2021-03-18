import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetBranchesListController {
  constructor(
    private branchesRepository: repositories.BranchesRepository,
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetBranchesList)
  async getBranchesList(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetBranchesListRequest)
    reqValid: apiToBackend.ToBackendGetBranchesListRequest
  ) {
    let { projectId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      memberId: user.user_id,
      projectId: projectId
    });

    let branches = await this.branchesRepository.find({
      project_id: projectId,
      repo_id: In([common.PROD_REPO_ID, user.alias])
    });

    let payload: apiToBackend.ToBackendGetBranchesListResponsePayload = {
      branchesList: branches.map(x => ({
        branchId: x.branch_id,
        repoId: x.repo_id
      }))
    };

    return payload;
  }
}
