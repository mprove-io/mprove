import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { RESTRICTED_USER_ALIAS } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendSetAvatarRequest,
  ToBackendSetAvatarResponsePayload
} from '~common/interfaces/to-backend/avatars/to-backend-set-avatar';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class SetAvatarController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetAvatar)
  async setAvatar(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendSetAvatarRequest = request.body;

    if (user.alias === RESTRICTED_USER_ALIAS) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    let { avatarSmall, avatarBig } = reqValid.payload;

    let avatar = await this.db.drizzle.query.avatarsTable.findFirst({
      where: eq(avatarsTable.userId, user.userId)
    });

    if (isDefined(avatar)) {
      avatar.avatarSmall = avatarSmall;
      avatar.avatarBig = avatarBig;
    } else {
      avatar = {
        userId: user.userId,
        avatarSmall: avatarSmall,
        avatarBig: avatarBig,
        serverTs: undefined
      };

      // this.makerService.makeAvatar({
      //   userId: user.userId,
      //   avatarSmall: avatarSmall,
      //   avatarBig: avatarBig
      // });
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
