import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { PATH_CONFIRM_EMAIL } from '~common/constants/top';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private cs: ConfigService<BackendConfig>
  ) {}

  async sendEmailVerification(item: {
    email: string;
    emailVerificationToken: string;
  }) {
    let hostUrl = this.cs.get<BackendConfig['hostUrl']>('hostUrl');

    let urlConfirmEmail = `${hostUrl}/${PATH_CONFIRM_EMAIL}?token=${item.emailVerificationToken}`;

    await this.mailerService.sendMail({
      to: item.email,
      subject: '[Mprove] Verify your email',
      text: `Click the link to complete email verification: ${urlConfirmEmail}`
    });
  }
}
