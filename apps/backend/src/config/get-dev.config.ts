import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~backend/barrels/common';
import { enums } from '~backend/barrels/enums';
import { interfaces } from '~backend/barrels/interfaces';

export function getDevConfig(envFilePath) {
  let envFile = parse(fse.readFileSync(envFilePath));

  let commonConfig: common.Config = common.getCommonConfig(envFile);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    backendEnv: <enums.BackendEnvEnum>envFile.BACKEND_ENV,
    jwtSecret: envFile.BACKEND_JWT_SECRET,
    allowTestRoutes: envFile.BACKEND_ALLOW_TEST_ROUTES,
    firstUserEmail: envFile.BACKEND_FIRST_USER_EMAIL,
    firstUserPassword: envFile.BACKEND_FIRST_USER_PASSWORD,
    registerOnlyInvitedUsers: <common.BoolEnum>(
      envFile.BACKEND_REGISTER_ONLY_INVITED_USERS
    ),
    //
    sendEmail: <common.BoolEnum>envFile.BACKEND_SEND_EMAIL,
    hostUrl: envFile.BACKEND_HOST_URL,
    sendEmailFromName: envFile.BACKEND_SEND_EMAIL_FROM_NAME,
    sendEmailFromAddress: envFile.BACKEND_SEND_EMAIL_FROM_ADDRESS,
    emailTransport: <enums.EmailTransportEnum>envFile.BACKEND_EMAIL_TRANSPORT,
    mailgunActiveApiKey: envFile.BACKEND_MAILGUN_ACTIVE_API_KEY,
    mailgunDomain: envFile.BACKEND_MAILGUN_DOMAIN,
    //
    smtpHost: envFile.BACKEND_SMTP_HOST,
    smtpPort: Number(envFile.BACKEND_SMTP_PORT),
    smtpSecure: <common.BoolEnum>envFile.BACKEND_SMTP_SECURE,
    smtpAuthUser: envFile.BACKEND_SMTP_AUTH_USER,
    smtpAuthPassword: envFile.BACKEND_SMTP_AUTH_PASSWORD,
    //
    rabbitmqDefaultUser: envFile.RABBITMQ_DEFAULT_USER,
    rabbitmqDefaultPass: envFile.RABBITMQ_DEFAULT_PASS,

    mysqlRootPassword: envFile.MYSQL_ROOT_PASSWORD,
    mysqlDatabase: envFile.MYSQL_DATABASE
  });
  return devConfig;
}
