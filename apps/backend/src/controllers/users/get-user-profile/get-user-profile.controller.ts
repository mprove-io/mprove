import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class GetUserProfileController {
  constructor() {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  async getUserProfile(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetUserProfileRequest)
    reqValid: apiToBackend.ToBackendGetUserProfileRequest
  ) {
    let payload: apiToBackend.ToBackendGetUserProfileResponsePayload = {
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
