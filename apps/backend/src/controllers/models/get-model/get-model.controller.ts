import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { ReposService } from '~backend/services/repos.service';

@Controller()
export class GetModelController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private reposService: ReposService,
    private modelsService: ModelsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModel)
  async getModel(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetModelRequest)
    reqValid: apiToBackend.ToBackendGetModelRequest
  ) {
    let { projectId, repoId, branchId, modelId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberExists({
      projectId: projectId,
      memberId: user.user_id
    });

    if (repoId !== common.PROD_REPO_ID) {
      await this.reposService.checkDevRepoId({
        userId: user.user_id,
        repoId: repoId
      });
    }

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: branch.struct_id,
      modelId: modelId
    });

    let payload: apiToBackend.ToBackendGetModelResponsePayload = {
      model: wrapper.wrapToApiModel(model)
    };

    return payload;
  }
}
