import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import {
  AttachUser,
  SkipJwtCheck,
  ValidateRequest
} from '~backend/decorators/_index';
import { LocalAuthGuard } from '~backend/guards/local-auth.guard';

@SkipJwtCheck()
@UseGuards(LocalAuthGuard)
@Controller()
export class LoginUserController {
  constructor(private jwtService: JwtService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser)
  async loginUser(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendLoginUserRequest)
    reqValid: apiToBackend.ToBackendLoginUserRequest
  ) {
    let payload: apiToBackend.ToBackendLoginUserResponsePayload = {
      token: this.jwtService.sign({ userId: user.user_id }),
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
