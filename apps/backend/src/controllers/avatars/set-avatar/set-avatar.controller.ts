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
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSetAvatarRequestDto,
  ToBackendSetAvatarResponseDto
} from '#backend/controllers/avatars/set-avatar/set-avatar.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { UsersService } from '#backend/services/db/users/users.service';
import { TabService } from '#backend/services/tab/tab.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
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
  ) {
    let { avatarSmall, avatarBig } = body.input;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let avatar = await this.db.drizzle.query.avatarsTable
      .findFirst({
        where: eq(avatarsTable.userId, user.userId)
      })
      .then(x => this.tabService.avatarEntToTab(x));

    if (isDefined(avatar)) {
      avatar.avatarSmall = avatarSmall;
      avatar.avatarBig = undefined; // do not use avatarBig (encryption time)
    } else {
      avatar = {
        userId: user.userId,
        avatarSmall: avatarSmall,
        avatarBig: undefined, // do not use avatarBig (encryption time)
        keyTag: undefined,
        serverTs: undefined
      };
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                avatars: [avatar]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetAvatarOutput = {
      avatarSmall: avatar.avatarSmall,
      avatarBig: avatar.avatarBig
    };

    return payload;
  }
}
