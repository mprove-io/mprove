import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetModelsListController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private modelsRepository: repositories.ModelsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetModelsList)
  async getModelsList(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetModelsListRequest)
    reqValid: apiToBackend.ToBackendGetModelsListRequest
  ) {
    let { projectId, isRepoProd, branchId } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let models = await this.modelsRepository.find({
      select: [
        'model_id',
        'label',
        'gr',
        'hidden',
        'access_roles',
        'access_users'
      ],
      where: { struct_id: branch.struct_id }
    });

    let modelsGrantedAccess = models.filter(x =>
      helper.checkAccess({
        userAlias: user.alias,
        member: member,
        vmd: x
      })
    );

    let payload: apiToBackend.ToBackendGetModelsListResponsePayload = {
      modelsList: modelsGrantedAccess.map(x => wrapper.wrapToApiModelsItem(x)),
      allModelsList: models.map(x => wrapper.wrapToApiModelsItem(x))
    };

    return payload;
  }
}
