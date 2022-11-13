import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
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
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetBranchesListRequest = request.body;

    let { projectId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      memberId: user.user_id,
      projectId: projectId
    });

    let branches = await this.branchesRepository.find({
      where: {
        project_id: projectId,
        repo_id: In([common.PROD_REPO_ID, user.user_id])
      },
      order: {
        branch_id: 'ASC'
      }
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetBranchesListResponsePayload = {
      userMember: apiMember,
      branchesList: branches.map(x => ({
        branchId: x.branch_id,
        isRepoProd: x.repo_id === common.PROD_REPO_ID
      }))
    };

    return payload;
  }
}
