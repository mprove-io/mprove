import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { UsersService } from '~backend/services/users.service';

@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class ResetUserPasswordController {
  constructor(
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>,
    private mailerService: MailerService,
    private usersService: UsersService
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

    user.password_reset_token = common.makeId();
    user.password_reset_expires_ts = helper.makeTsUsingOffsetFromNow(
      constants.PASSWORD_EXPIRES_OFFSET
    );

    await this.dbService.writeRecords({
      modify: true,
      records: {
        users: [user]
      }
    });

    let hostUrl = this.cs.get<interfaces.Config['hostUrl']>('hostUrl');

    let urlUpdatePassword = `${hostUrl}/${common.PATH_UPDATE_PASSWORD}?token=${user.password_reset_token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: '[Mprove] Reset your password',
      text: `You requested password change. Click the link to set a new password: ${urlUpdatePassword}`
    });

    let payload = {};

    return payload;
  }
}
