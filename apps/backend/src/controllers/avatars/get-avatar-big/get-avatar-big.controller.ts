import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetAvatarBigRequestDto,
  ToBackendGetAvatarBigResponseDto
} from '#backend/controllers/avatars/get-avatar-big/get-avatar-big.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  AvatarTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type AvatarEnt,
  avatarsTable
} from '#backend/drizzle/postgres/schema/avatars';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { AvatarEntToTabResultError } from '#common/types/backend/function-errors/avatar-ent-to-tab-result-error';
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
  ): Promise<BackendResultForOperation<'getAvatarBig'>> {
    return Result.pipe(
      Result.succeed({
        avatarUserId: body.input.avatarUserId
      }),
      Result.bind(
        'avatar',
        (v): Result.ResultAsync<AvatarTab, AvatarEntToTabResultError> =>
          this.db.drizzle.query.avatarsTable
            .findFirst({
              where: eq(avatarsTable.userId, v.avatarUserId)
            })
            .then((avatarEnt: AvatarEnt) =>
              isUndefined(avatarEnt)
                ? Result.succeed(undefined)
                : this.tabService.avatarEntToTabResult({ avatarEnt: avatarEnt })
            )
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
