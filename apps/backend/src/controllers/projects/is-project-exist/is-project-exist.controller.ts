import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class IsProjectExistController {
  constructor(
    private orgsService: OrgsService,
    private projectsRepository: repositories.ProjectsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsProjectExist)
  async isProjectExist(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendIsProjectExistRequest = request.body;

    let { name, orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    let project = await this.projectsRepository.findOne({
      where: { name: name }
    });

    let payload: apiToBackend.ToBackendIsProjectExistResponsePayload = {
      isExist: common.isDefined(project)
    };

    return payload;
  }
}
