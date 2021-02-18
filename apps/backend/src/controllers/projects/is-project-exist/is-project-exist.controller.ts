import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class IsProjectExistController {
  constructor(
    private orgsRepository: repositories.OrgsRepository,
    private projectsRepository: repositories.ProjectsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsProjectExist)
  async isProjectExist(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendIsProjectExistRequest)
    reqValid: apiToBackend.ToBackendIsProjectExistRequest
  ) {
    let { name, orgId } = reqValid.payload;

    let org = await this.orgsRepository.findOne({ org_id: orgId });

    if (common.isUndefined(org)) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_ORG_IS_NOT_EXIST
      });
    }

    let project = await this.projectsRepository.findOne({ name: name });

    let payload: apiToBackend.ToBackendIsProjectExistResponsePayload = {
      isExist: common.isDefined(project)
    };

    return payload;
  }
}
