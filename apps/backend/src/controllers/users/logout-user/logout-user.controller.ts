import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendLogoutUserRequestDto,
  ToBackendLogoutUserResponseDto
} from '#backend/controllers/users/logout-user/logout-user.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';

@ApiTags('Users')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class LogoutUserController {
  constructor(private tabService: TabService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendLogoutUser)
  @ApiOperation({
    summary: 'LogoutUser',
    description: 'Logout the current user'
  })
  @ApiOkResponse({
    type: ToBackendLogoutUserResponseDto
  })
  async logoutUser(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendLogoutUserRequestDto
  ) {
    let payload = {};

    return payload;
  }
}
