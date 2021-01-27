import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { api } from '~/barrels/api';
import { enums } from '~/barrels/enums';
import { interfaces } from '~/barrels/interfaces';

export function getBaseConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: api.Config = api.getCommonConfig(envFile);

  let baseConfig: interfaces.Config = Object.assign({}, commonConfig, {
    backendEnv: <enums.BackendEnvEnum>envFile.BACKEND_ENV,
    backendFirstUserEmail: envFile.BACKEND_FIRST_USER_EMAIL,
    backendFirstUserPassword: envFile.BACKEND_FIRST_USER_PASSWORD,
    backendRegisterOnlyInvitedUsers: <api.BoolEnum>(
      envFile.BACKEND_REGISTER_ONLY_INVITED_USERS
    ),
    //
    backendSendEmail: <api.BoolEnum>envFile.BACKEND_SEND_EMAIL,
    backendVerifyEmailUrl: envFile.BACKEND_VERIFY_EMAIL_URL,
    backendSendEmailFrom: envFile.BACKEND_SEND_EMAIL_FROM,
    backendEmailTransport: <enums.EmailTransportEnum>(
      envFile.BACKEND_EMAIL_TRANSPORT
    ),
    backendMailgunActiveApiKey: envFile.BACKEND_MAILGUN_ACTIVE_API_KEY,
    backendMailgunDomain: envFile.BACKEND_MAILGUN_DOMAIN,
    //
    backendSmtpHost: envFile.BACKEND_SMTP_HOST,
    backendSmtpPort: Number(envFile.BACKEND_SMTP_PORT),
    backendSmtpSecure: <api.BoolEnum>envFile.BACKEND_SMTP_SECURE,
    backendSmtpAuthUser: envFile.BACKEND_SMTP_AUTH_USER,
    backendSmtpAuthPassword: envFile.BACKEND_SMTP_AUTH_PASSWORD,
    //
    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS,

    mysqlRootPassword: envFile.MYSQL_ROOT_PASSWORD,
    mysqlDatabase: envFile.MYSQL_DATABASE
  });
  return baseConfig;
}
