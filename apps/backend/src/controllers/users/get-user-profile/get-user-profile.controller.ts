import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { decorators } from '~backend/barrels/decorators';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';

@Controller()
export class GetUserProfileController {
  constructor(private cs: ConfigService<interfaces.Config>) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetUserProfile)
  async getUserProfile(
    @Body() body,
    @decorators.AttachUser() user: entities.UserEntity
  ) {
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
