import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { ProjectEnt } from '~backend/drizzle/postgres/schema/projects';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { PATH_CONFIRM_EMAIL } from '~common/constants/top';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private cs: ConfigService<BackendConfig>
  ) {}

  async sendVerification(item: {
    email: string;
    emailVerificationToken: string;
  }) {
    let { email, emailVerificationToken } = item;

    let hostUrl = this.cs.get<BackendConfig['hostUrl']>('hostUrl');

    let urlConfirmEmail = `${hostUrl}/${PATH_CONFIRM_EMAIL}?token=${emailVerificationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '[Mprove] Verify your email',
      text: `Click the link to complete email verification: ${urlConfirmEmail}`
    });
  }

  async sendResetPassword(item: {
    user: UserEnt;
    urlUpdatePassword: string;
  }) {
    let { user, urlUpdatePassword } = item;

    await this.mailerService.sendMail({
      to: user.email,
      subject: '[Mprove] Reset your password',
      text: `You requested password change. Click the link to set a new password: ${urlUpdatePassword}`
    });
  }

  async sendInviteToVerifiedUser(item: {
    email: string;
    user: UserEnt;
    project: ProjectEnt;
    urlProjectMetrics: string;
  }) {
    let { email, user, project, urlProjectMetrics } = item;

    await this.mailerService.sendMail({
      to: email,
      subject: `[Mprove] ${user.alias} added you to ${project.name} project team`,
      text: `Project metrics: ${urlProjectMetrics}`
    });
  }

  async sendInviteToUnverifiedUser(item: {
    email: string;
    user: UserEnt;
    project: ProjectEnt;
    urlCompleteRegistration: string;
  }) {
    let { email, user, project, urlCompleteRegistration } = item;

    await this.mailerService.sendMail({
      to: email,
      subject: `[Mprove] ${user.alias} invited you to ${project.name} project team`,
      text: `Click the link to complete registration: ${urlCompleteRegistration}`
    });
  }
}
