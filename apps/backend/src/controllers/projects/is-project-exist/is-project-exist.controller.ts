import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { OrgsService } from '~backend/services/orgs.service';

@Controller()
export class IsProjectExistController {
  constructor(
    private orgsService: OrgsService,
    private projectsRepository: repositories.ProjectsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsProjectExist)
  async isProjectExist(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendIsProjectExistRequest)
    reqValid: apiToBackend.ToBackendIsProjectExistRequest
  ) {
    let { name, orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    let project = await this.projectsRepository.findOne({ name: name });

    let payload: apiToBackend.ToBackendIsProjectExistResponsePayload = {
      isExist: common.isDefined(project)
    };

    return payload;
  }
}