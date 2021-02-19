import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { OrgsService } from '~backend/services/orgs.service';

@Controller()
export class GetOrgController {
  constructor(private orgsService: OrgsService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrg)
  async getOrg(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetOrgRequest)
    reqValid: apiToBackend.ToBackendGetOrgRequest
  ) {
    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.user_id
    });

    let payload: apiToBackend.ToBackendGetOrgResponsePayload = {
      org: wrapper.wrapToApiOrg(org)
    };

    return payload;
  }
}
