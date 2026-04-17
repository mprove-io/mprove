import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetAvatarBigRequestDto,
  ToBackendGetAvatarBigResponseDto
} from '#backend/controllers/avatars/get-avatar-big/get-avatar-big.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetAvatarBigResponsePayload } from '#common/zod/to-backend/avatars/to-backend-get-avatar-big';

@ApiTags('Avatars')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetAvatarBigController {
  constructor(
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
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
    let { avatarUserId } = body.payload;

    let avatar = await this.db.drizzle.query.avatarsTable
      .findFirst({
        where: eq(avatarsTable.userId, avatarUserId)
      })
      .then(x => this.tabService.avatarEntToTab(x));

    let payload: ToBackendGetAvatarBigResponsePayload = {
      avatarSmall: avatar?.avatarSmall,
      avatarBig: avatar?.avatarBig
    };

    return payload;
  }
}
