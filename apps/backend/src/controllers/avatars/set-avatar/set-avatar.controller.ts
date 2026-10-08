import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetAvatarRequestDto,
  ToBackendSetAvatarResponseDto
} from '#backend/controllers/avatars/set-avatar/set-avatar.dto';
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
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users/users.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { AvatarEntToTabResultError } from '#common/types/backend/function-errors/avatar-ent-to-tab-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetAvatarOutput } from '#common/types/backend/routes/avatars/set-avatar/set-avatar-output';

@ApiTags('Avatars')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class SetAvatarController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        ...body.input,
        user: user,
        usersService: this.usersService,
        tabService: this.tabService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.andThrough(v =>
        v.usersService.checkUserIsNotRestrictedResult({ user: v.user })
      ),
      Result.bind(
        'avatar',
        (v): Result.ResultAsync<AvatarTab, AvatarEntToTabResultError> =>
          v.db.drizzle.query.avatarsTable
            .findFirst({
              where: eq(avatarsTable.userId, v.user.userId)
            })
            .then((avatarEnt: AvatarEnt) =>
              isUndefined(avatarEnt)
                ? Result.succeed({
                    userId: v.user.userId,
                    avatarSmall: v.avatarSmall,
                    avatarBig: undefined, // do not use avatarBig (encryption time)
                    keyTag: undefined,
                    serverTs: undefined
                  })
                : v.tabService.avatarEntToTabResult({ avatarEnt: avatarEnt })
            )
      ),
      Result.inspect(v => {
        v.avatar.avatarSmall = v.avatarSmall;

        v.avatar.avatarBig = undefined; // do not use avatarBig (encryption time)
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insertOrUpdate: {
                        avatars: [v.avatar]
                      }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
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
