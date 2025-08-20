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

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
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
