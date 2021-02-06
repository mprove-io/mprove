import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '~backend/auth-guards/jwt-auth.guard';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';
import { User } from '~backend/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class GetUserProfileController {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  async getUserProfile(@Body() body, @User() user: entities.UserEntity) {
    try {
      let reqValid = await common.transformValid({
        classType: apiToBackend.ToBackendGetUserProfileRequest,
        object: body,
        errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

      let payload: apiToBackend.ToBackendGetUserProfileResponsePayload = {
        user: wrapper.wrapToApiUser(user)
      };

      return common.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
