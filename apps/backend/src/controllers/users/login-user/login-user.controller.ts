import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from '~backend/auth-guards/local-auth.guard';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { decorators } from '~backend/barrels/decorators';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';

@decorators.Public()
@UseGuards(LocalAuthGuard)
@Controller()
export class LoginUserController {
  constructor(
    private jwtService: JwtService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser)
  async loginUser(
    @Body() body,
    @decorators.AttachUser() user: entities.UserEntity
  ) {
    try {
      let reqValid = await common.transformValid({
        classType: apiToBackend.ToBackendLoginUserRequest,
        object: body,
        errorMessage: apiToBackend.ErEnum.BACKEND_WRONG_REQUEST_PARAMS
      });

      let payload: apiToBackend.ToBackendLoginUserResponsePayload = {
        token: this.jwtService.sign({ userId: user.user_id }),
        user: wrapper.wrapToApiUser(user)
      };

      return common.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return common.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
