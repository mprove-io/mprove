import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetUserProfileController {
  constructor(private wrapToApiService: WrapToApiService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  async getUserProfile(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetUserProfileRequest = request.body;

    let payload: apiToBackend.ToBackendGetUserProfileResponsePayload = {
      user: this.wrapToApiService.wrapToApiUser(user)
    };

    return payload;
  }
}
