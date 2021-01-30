import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '~/auth-guards/jwt-auth.guard';
import { api } from '~/barrels/api';
import { entities } from '~/barrels/entities';
import { interfaces } from '~/barrels/interfaces';
import { wrapper } from '~/barrels/wrapper';
import { User } from '~/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller()
export class GetUserProfileController {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  async getUserProfile(@Body() body, @User() user: entities.UserEntity) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBackendGetUserProfileRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let payload: api.ToBackendGetUserProfileResponsePayload = {
        user: wrapper.wrapToApiUser(user)
      };

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
