import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from '~/auth-guards/local-auth.guard';
import { api } from '~/barrels/api';
import { entities } from '~/barrels/entities';
import { interfaces } from '~/barrels/interfaces';
import { wrapper } from '~/barrels/wrapper';
import { User } from '~/decorators/user.decorator';

@UseGuards(LocalAuthGuard)
@Controller()
export class LoginUserController {
  constructor(
    private jwtService: JwtService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  @Post(api.ToBackendRequestInfoNameEnum.ToBackendLoginUser)
  async loginUser(@Body() body, @User() user: entities.UserEntity) {
    try {
      let reqValid = await api.transformValid({
        classType: api.ToBackendLoginUserRequest,
        object: body,
        errorMessage: api.ErEnum.M_BACKEND_WRONG_REQUEST_PARAMS
      });

      let payload: api.ToBackendLoginUserResponsePayload = {
        token: this.jwtService.sign({ userId: user.user_id }),
        user: wrapper.wrapToApiUser(user)
      };

      return api.makeOkResponse({ payload, cs: this.cs, req: reqValid });
    } catch (e) {
      return api.makeErrorResponse({ e, cs: this.cs, req: body });
    }
  }
}
