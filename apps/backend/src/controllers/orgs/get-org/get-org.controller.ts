import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { IsOrgOwnerService } from '~backend/services/is-org-owner.service';

@Controller()
export class GetOrgController {
  constructor(private isOrgOwnerService: IsOrgOwnerService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetOrg)
  async getOrg(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetOrgRequest)
    reqValid: apiToBackend.ToBackendGetOrgRequest
  ) {
    let { orgId } = reqValid.payload;

    let org = await this.isOrgOwnerService.getOrg({
      orgId: orgId,
      userId: user.user_id
    });

    let payload: apiToBackend.ToBackendGetOrgResponsePayload = {
      org: wrapper.wrapToApiOrg(org)
    };

    return payload;
  }
}
