import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, SkipJwtCheck } from '~backend/decorators/_index';
import { LocalAuthGuard } from '~backend/guards/local-auth.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@SkipJwtCheck()
@UseGuards(LocalAuthGuard)
@UseGuards(ValidateRequestGuard)
@Controller()
export class LoginUserController {
  constructor(private jwtService: JwtService) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser)
  async loginUser(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendLoginUserRequest = request.body;

    let payload: apiToBackend.ToBackendLoginUserResponsePayload = {
      token: this.jwtService.sign({ userId: user.user_id }),
      user: wrapper.wrapToApiUser(user)
    };

    return payload;
  }
}
