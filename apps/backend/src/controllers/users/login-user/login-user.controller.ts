import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from '~backend/auth-guards/local-auth.guard';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { wrapper } from '~backend/barrels/wrapper';
import {
  AttachUser,
  Public,
  ValidateRequest
} from '~backend/decorators/_index';

@Public()
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
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendLoginUserRequest)
    reqValid: apiToBackend.ToBackendLoginUserRequest
  ) {
    try {
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
