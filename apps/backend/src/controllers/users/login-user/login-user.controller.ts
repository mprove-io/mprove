import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AttachUser, SkipJwtCheck } from '~backend/decorators/_index';
import { LocalAuthGuard } from '~backend/guards/local-auth.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@SkipJwtCheck()
@UseGuards(LocalAuthGuard)
@UseGuards(ValidateRequestGuard)
@Controller()
export class LoginUserController {
  constructor(
    private jwtService: JwtService,
    private wrapToApiService: WrapToApiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendLoginUser)
  async loginUser(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendLoginUserRequest = request.body;

    let payload: ToBackendLoginUserResponsePayload = {
      token: this.jwtService.sign({ userId: user.userId }),
      user: this.wrapToApiService.wrapToApiUser(user)
    };

    return payload;
  }
}
