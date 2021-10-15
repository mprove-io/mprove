import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  async sendEmailVerification(item: {
    email: string;
    emailVerificationToken: string;
  }) {
    let hostUrl = this.cs.get<interfaces.Config['hostUrl']>('hostUrl');

    let urlConfirmEmail = `${hostUrl}/${common.PATH_CONFIRM_EMAIL}?token=${item.emailVerificationToken}`;

    await this.mailerService.sendMail({
      to: item.email,
      subject: '[Mprove] Verify your email',
      text: `Click the link to complete email verification: ${urlConfirmEmail}`
    });
  }
}
