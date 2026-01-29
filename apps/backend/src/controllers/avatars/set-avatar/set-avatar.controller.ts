import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '#backend/drizzle/postgres/schema/avatars';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { UsersService } from '#backend/services/db/users.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendSetAvatarRequest,
  ToBackendSetAvatarResponsePayload
} from '#common/interfaces/to-backend/avatars/to-backend-set-avatar';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class SetAvatarController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetAvatar)
  async setAvatar(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetAvatarRequest = request.body;

    let { avatarSmall, avatarBig } = reqValid.payload;

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

    let payload: ToBackendSetAvatarResponsePayload = {
      avatarSmall: avatar.avatarSmall,
      avatarBig: avatar.avatarBig
    };

    return payload;
  }
}
