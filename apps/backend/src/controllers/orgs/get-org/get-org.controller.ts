import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class GetOrgController {
  constructor(private orgsRepository: repositories.OrgsRepository) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrg)
  async getOrg(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetOrgRequest)
    reqValid: apiToBackend.ToBackendGetOrgRequest
  ) {
    let { orgId } = reqValid.payload;

    let org = await this.orgsRepository.findOne({
      org_id: orgId
    });

    if (org.owner_id !== user.user_id) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_ORG
      });
    }

    let payload: apiToBackend.ToBackendGetOrgResponsePayload = {
      org: wrapper.wrapToApiOrg(org)
    };

    return payload;
  }
}
