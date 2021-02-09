import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class ResetUserPasswordController {
  constructor(
    private connection: Connection,
    private cs: ConfigService<interfaces.Config>,
    private mailerService: MailerService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendResetUserPassword)
  async resetUserPassword(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendResetUserPasswordRequest)
    reqValid: apiToBackend.ToBackendResetUserPasswordRequest
  ) {
    user.password_reset_token = common.makeId();
    user.password_reset_expires_ts = helper.makeTsUsingOffsetFromNow(
      constants.PASSWORD_EXPIRES_OFFSET
    );

    await this.connection.transaction(async manager => {
      await db.modifyRecords({
        manager: manager,
        records: {
          users: [user]
        }
      });
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
