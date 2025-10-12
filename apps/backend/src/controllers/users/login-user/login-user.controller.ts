import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { LocalAuthGuard } from '~backend/guards/local-auth.guard';
import { ThrottlerIpGuard } from '~backend/guards/throttler-ip.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { UsersService } from '~backend/services/db/users.service';
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
    private usersService: UsersService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendLoginUser)
  async loginUser(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendLoginUserRequest = request.body;

    let token = this.jwtService.sign({ userId: user.userId });

    let payload: ToBackendLoginUserResponsePayload = {
      token: token,
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}
