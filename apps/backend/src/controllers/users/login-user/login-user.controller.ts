import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from '~backend/auth-guards/local-auth.guard';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
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
