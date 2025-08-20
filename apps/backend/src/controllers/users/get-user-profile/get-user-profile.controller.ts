import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetUserProfileRequest,
  ToBackendGetUserProfileResponsePayload
} from '~common/interfaces/to-backend/users/to-backend-get-user-profile';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetUserProfileController {
  constructor(private wrapToApiService: WrapToApiService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  async getUserProfile(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetUserProfileRequest = request.body;

    let payload: ToBackendGetUserProfileResponsePayload = {
      user: this.wrapToApiService.wrapToApiUser(user)
    };

    return payload;
  }
}
