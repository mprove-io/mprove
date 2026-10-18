import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetAvatarBigRequestDto,
  ToBackendGetAvatarBigResponseDto
} from '#backend/controllers/avatars/get-avatar-big/get-avatar-big.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  AvatarTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetAvatarBigOutput } from '#common/types/backend/routes/avatars/get-avatar-big/get-avatar-big-output';

@ApiTags('Avatars')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetAvatarBigController {
  constructor(private dbService: DbService) {}

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
  ): Promise<BackendResultForOperation<'getAvatarBig'>> {
    return Result.pipe(
      Result.succeed({
        avatarUserId: body.input.avatarUserId
      }),
      Result.bind(
        'avatar',
        (v): Result.ResultAsync<AvatarTab, AvatarEntToTabError> =>
          this.dbService.avatars.findFirst({
            where: eq(avatarsTable.userId, v.avatarUserId)
          })
      ),
      Result.map(
        (v): ToBackendGetAvatarBigOutput => ({
          avatarSmall: v.avatar?.avatarSmall,
          avatarBig: v.avatar?.avatarBig
        })
      )
    );
  }
}
