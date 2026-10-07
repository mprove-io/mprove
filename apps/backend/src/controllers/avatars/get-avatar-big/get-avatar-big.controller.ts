import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetAvatarBigRequestDto,
  ToBackendGetAvatarBigResponseDto
} from '#backend/controllers/avatars/get-avatar-big/get-avatar-big.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { TabService } from '#backend/services/tab/tab.service';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetAvatarBigOutput } from '#common/types/backend/routes/avatars/get-avatar-big/get-avatar-big-output';

@ApiTags('Avatars')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetAvatarBigController {
  constructor(
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGetAvatarBig' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetAvatarBig',
    description: "Get a user's avatar image"
  })
  @ApiOkResponse({
    type: ToBackendGetAvatarBigResponseDto
  })
  async getAvatarBig(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetAvatarBigRequestDto
  ) {
    let { avatarUserId } = body.input;

    let avatar = await this.db.drizzle.query.avatarsTable
      .findFirst({
        where: eq(avatarsTable.userId, avatarUserId)
      })
      .then(x => this.tabService.avatarEntToTab(x));

    let payload: ToBackendGetAvatarBigOutput = {
      avatarSmall: avatar?.avatarSmall,
      avatarBig: avatar?.avatarBig
    };

    return payload;
  }
}
