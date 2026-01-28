import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { PATH_CONFIRM_EMAIL } from '#common/constants/top';
import { BackendConfig } from '~backend/config/backend-config';
import { ProjectTab, UserTab } from '~backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class EmailService {
  transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor(private cs: ConfigService<BackendConfig>) {
    let fromName =
      cs.get<BackendConfig['sendEmailFromName']>('sendEmailFromName');

    let fromAddress = cs.get<BackendConfig['sendEmailFromAddress']>(
      'sendEmailFromAddress'
    );

    this.transporter = nodemailer.createTransport(
      {
        host: cs.get<BackendConfig['smtpHost']>('smtpHost'),
        port: cs.get<BackendConfig['smtpPort']>('smtpPort'),
        secure: cs.get<BackendConfig['smtpSecure']>('smtpSecure'),
        auth: {
          user: cs.get<BackendConfig['smtpAuthUser']>('smtpAuthUser'),
          pass: cs.get<BackendConfig['smtpAuthPassword']>('smtpAuthPassword')
        }
      },
      {
        from: `"${fromName}" <${fromAddress}>`
      }
    );
  }

  async sendVerification(item: {
    email: string;
    emailVerificationToken: string;
  }) {
    let { email, emailVerificationToken } = item;

    let hostUrl = this.cs
      .get<BackendConfig['hostUrl']>('hostUrl')
      .split(',')[0];

    let urlConfirmEmail = `${hostUrl}/${PATH_CONFIRM_EMAIL}?token=${emailVerificationToken}`;

    await this.transporter.sendMail({
      to: email,
      subject: '[Mprove] Verify your email',
      text: `Click the link to complete email verification: ${urlConfirmEmail}`
    });
  }

  async sendResetPassword(item: { user: UserTab; urlUpdatePassword: string }) {
    let { user, urlUpdatePassword } = item;

    await this.transporter.sendMail({
      to: user.email,
      subject: '[Mprove] Reset your password',
      text: `You requested password change. Click the link to set a new password: ${urlUpdatePassword}`
    });
  }

  async sendInviteToVerifiedUser(item: {
    email: string;
    user: UserTab;
    project: ProjectTab;
    urlProjectMetrics: string;
  }) {
    let { email, user, project, urlProjectMetrics } = item;

    await this.transporter.sendMail({
      to: email,
      subject: `[Mprove] ${user.alias} added you to ${project.name} project team`,
      text: `Project metrics: ${urlProjectMetrics}`
    });
  }

  async sendInviteToUnverifiedUser(item: {
    email: string;
    user: UserTab;
    project: ProjectTab;
    urlCompleteRegistration: string;
  }) {
    let { email, user, project, urlCompleteRegistration } = item;

    await this.transporter.sendMail({
      to: email,
      subject: `[Mprove] ${user.alias} invited you to ${project.name} project team`,
      text: `Click the link to complete registration: ${urlCompleteRegistration}`
    });
  }
}
