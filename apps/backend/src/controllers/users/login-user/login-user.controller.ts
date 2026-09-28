import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendLoginUserRequestDto,
  ToBackendLoginUserResponseDto
} from '#backend/controllers/users/login-user/login-user.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { LocalAuthGuard } from '#backend/guards/local-auth.guard';
import { ThrottlerIpGuard } from '#backend/guards/throttler-ip.guard';
import { UsersService } from '#backend/services/db/users.service';
import { TabService } from '#backend/services/tab.service';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendLoginUserOutput } from '#common/zod/backend/routes/users/login-user/login-user-output';

@ApiTags('Users')
@SkipJwtCheck()
@UseGuards(ThrottlerIpGuard, LocalAuthGuard)
@Controller()
export class LoginUserController {
  constructor(
    private tabService: TabService,
    private jwtService: JwtService,
    private usersService: UsersService
  ) {}

  @Post('api/ToBackendLoginUser' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'LoginUser',
    description: 'Authenticate a user and issue a JWT token'
  })
  @ApiOkResponse({
    type: ToBackendLoginUserResponseDto
  })
  async loginUser(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendLoginUserRequestDto
  ) {
    let token = this.jwtService.sign({ userId: user.userId });

    let payload: ToBackendLoginUserOutput = {
      token: token,
      user: this.usersService.tabToApi({ user: user })
    };

    return payload;
  }
}
