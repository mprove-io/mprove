import { MailerService } from '@nestjs-modules/mailer';
import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { UsersService } from '~backend/services/users.service';

let retry = require('async-retry');

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class ResetUserPasswordController {
  constructor(
    private mailerService: MailerService,
    private usersService: UsersService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResetUserPassword)
  async resetUserPassword(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendResetUserPasswordRequest = request.body;

    let { email } = reqValid.payload;

    let user = await this.usersService.getUserByEmailCheckExists({
      email: email
    });

    if (user.alias === common.RESTRICTED_USER_ALIAS) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_USER
      });
    }

    this.usersService.checkUserHashIsDefined({ user: user });

    user.passwordResetToken = common.makeId();
    user.passwordResetExpiresTs = helper.makeTsUsingOffsetFromNow(
      constants.PASSWORD_EXPIRES_OFFSET
    );

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                users: [user]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let hostUrl = this.cs.get<interfaces.Config['hostUrl']>('hostUrl');

    let urlUpdatePassword = `${hostUrl}/${common.PATH_UPDATE_PASSWORD}?token=${user.passwordResetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: '[Mprove] Reset your password',
      text: `You requested password change. Click the link to set a new password: ${urlUpdatePassword}`
    });

    let payload = {};

    return payload;
  }
}
