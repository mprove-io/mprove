import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendSetAvatarRequestDto,
  ToBackendSetAvatarResponseDto
} from '#backend/controllers/avatars/set-avatar/set-avatar.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  AvatarTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { UsersService } from '#backend/services/db/users/users.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { AvatarEntToTabError } from '#common/types/backend/function-errors/avatar-ent-to-tab-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetAvatarOutput } from '#common/types/backend/routes/avatars/set-avatar/set-avatar-output';

@ApiTags('Avatars')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class SetAvatarController {
  constructor(
    private db: DbService,
    private usersService: UsersService
  ) {}

  @Post('api/ToBackendSetAvatar' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SetAvatar',
    description: "Update the current user's avatar image"
  })
  @ApiOkResponse({
    type: ToBackendSetAvatarResponseDto
  })
  async setAvatar(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetAvatarRequestDto
  ): Promise<BackendResultForOperation<'setAvatar'>> {
    return Result.pipe(
      Result.succeed({
        avatarSmall: body.input.avatarSmall,
        avatarBig: body.input.avatarBig,
        user: user
      }),
      Result.andThrough(v =>
        this.usersService.checkUserIsNotRestricted({ user: v.user })
      ),
      Result.bind(
        'avatar',
        (v): Result.ResultAsync<AvatarTab, AvatarEntToTabError> =>
          this.db.avatars.findFirst({
            where: eq(avatarsTable.userId, v.user.userId)
          })
      ),
      Result.map(v => {
        if (isUndefined(v.avatar)) {
          v.avatar = {
            userId: v.user.userId,
            avatarSmall: v.avatarSmall,
            avatarBig: undefined, // do not use avatarBig (encryption time)
            keyTag: undefined,
            serverTs: undefined
          };
        }

        v.avatar.avatarSmall = v.avatarSmall;
        v.avatar.avatarBig = undefined; // do not use avatarBig (encryption time)

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: {
            avatars: [v.avatar]
          }
        })
      ),
      Result.map(
        (v): ToBackendSetAvatarOutput => ({
          avatarSmall: v.avatar.avatarSmall,
          avatarBig: v.avatar.avatarBig
        })
      )
    );
  }
}
