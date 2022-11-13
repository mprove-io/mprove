import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetUserProfileController {
  constructor() {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  async getUserProfile(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetUserProfileRequest = request.body;

    let payload: apiToBackend.ToBackendGetUserProfileResponsePayload = {
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
