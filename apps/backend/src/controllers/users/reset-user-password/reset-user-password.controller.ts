import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';

@SkipJwtCheck()
@Controller()
export class ResetUserPasswordController {
  constructor(
    private dbService: DbService,
    private cs: ConfigService<interfaces.Config>,
    private mailerService: MailerService,
    private usersRepository: repositories.UsersRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResetUserPassword)
  async resetUserPassword(
    @ValidateRequest(apiToBackend.ToBackendResetUserPasswordRequest)
    reqValid: apiToBackend.ToBackendResetUserPasswordRequest
  ) {
    let { email } = reqValid.payload;

    let user = await this.usersRepository.findOne({
      email: email
    });

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

    let link = `${hostUrl}/update-password?token=${user.password_reset_token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: '[Mprove] Reset your password',
      text: `You requested password change. Click the link to set new password: ${link}`
    });

    let payload = {};

    return payload;
  }
}
