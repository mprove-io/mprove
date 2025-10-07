import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { LocalAuthGuard } from '~backend/guards/local-auth.guard';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendLoginUserRequest,
  ToBackendLoginUserResponsePayload
} from '~common/interfaces/to-backend/users/to-backend-login-user';

@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, LocalAuthGuard, ValidateRequestGuard)
@Controller()
export class LoginUserController {
  constructor(
    private jwtService: JwtService,
    private wrapToApiService: WrapEnxToApiService
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
