import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~backend/barrels/common';
import { enums } from '~backend/barrels/enums';
import { interfaces } from '~backend/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let envFile;

  if (common.isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let commonConfig: common.Config = common.getCommonConfig(envFile);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    backendEnv: <enums.BackendEnvEnum>(
      (process.env.BACKEND_ENV || envFile.BACKEND_ENV)
    ),
    isScheduler: <common.BoolEnum>(
      (process.env.BACKEND_IS_SCHEDULER || envFile.BACKEND_IS_SCHEDULER)
    ),
    mDataBigqueryPath:
      process.env.M_DATA_BIGQUERY_PATH || envFile.M_DATA_BIGQUERY_PATH,
    jwtSecret: process.env.BACKEND_JWT_SECRET || envFile.BACKEND_JWT_SECRET,
    specialKey: process.env.BACKEND_SPECIAL_KEY || envFile.BACKEND_SPECIAL_KEY,
    allowTestRoutes:
      process.env.BACKEND_ALLOW_TEST_ROUTES ||
      envFile.BACKEND_ALLOW_TEST_ROUTES,
    firstUserEmail:
      process.env.BACKEND_FIRST_USER_EMAIL || envFile.BACKEND_FIRST_USER_EMAIL,
    firstUserPassword:
      process.env.BACKEND_FIRST_USER_PASSWORD ||
      envFile.BACKEND_FIRST_USER_PASSWORD,
    firstOrgId:
      process.env.BACKEND_FIRST_ORG_ID || envFile.BACKEND_FIRST_ORG_ID,
    firstProjectId:
      process.env.BACKEND_FIRST_PROJECT_ID || envFile.BACKEND_FIRST_PROJECT_ID,
    registerOnlyInvitedUsers: <common.BoolEnum>(
      (process.env.BACKEND_REGISTER_ONLY_INVITED_USERS ||
        envFile.BACKEND_REGISTER_ONLY_INVITED_USERS)
    ),
    //
    sendEmail: <common.BoolEnum>(
      (process.env.BACKEND_SEND_EMAIL || envFile.BACKEND_SEND_EMAIL)
    ),
    hostUrl: process.env.BACKEND_HOST_URL || envFile.BACKEND_HOST_URL,
    sendEmailFromName:
      process.env.BACKEND_SEND_EMAIL_FROM_NAME ||
      envFile.BACKEND_SEND_EMAIL_FROM_NAME,
    sendEmailFromAddress:
      process.env.BACKEND_SEND_EMAIL_FROM_ADDRESS ||
      envFile.BACKEND_SEND_EMAIL_FROM_ADDRESS,
    emailTransport: <enums.EmailTransportEnum>(
      (process.env.BACKEND_EMAIL_TRANSPORT || envFile.BACKEND_EMAIL_TRANSPORT)
    ),
    //
    mailgunActiveApiKey:
      process.env.BACKEND_MAILGUN_ACTIVE_API_KEY ||
      envFile.BACKEND_MAILGUN_ACTIVE_API_KEY,
    mailgunDomain:
      process.env.BACKEND_MAILGUN_DOMAIN || envFile.BACKEND_MAILGUN_DOMAIN,
    //
    smtpHost: process.env.BACKEND_SMTP_HOST || envFile.BACKEND_SMTP_HOST,
    smtpPort: Number(
      process.env.BACKEND_SMTP_PORT || envFile.BACKEND_SMTP_PORT
    ),
    smtpSecure: <common.BoolEnum>(
      (process.env.BACKEND_SMTP_SECURE || envFile.BACKEND_SMTP_SECURE)
    ),
    smtpAuthUser:
      process.env.BACKEND_SMTP_AUTH_USER || envFile.BACKEND_SMTP_AUTH_USER,
    smtpAuthPassword:
      process.env.BACKEND_SMTP_AUTH_PASSWORD ||
      envFile.BACKEND_SMTP_AUTH_PASSWORD,
    //
    rabbitUser: process.env.RABBIT_USER || envFile.RABBIT_USER,
    rabbitPass: process.env.RABBIT_PASS || envFile.RABBIT_PASS,
    rabbitHost: process.env.RABBIT_HOST || envFile.RABBIT_HOST,
    rabbitPort: process.env.RABBIT_PORT || envFile.RABBIT_PORT,
    rabbitProtocol: process.env.RABBIT_PROTOCOL || envFile.RABBIT_PROTOCOL,

    mysqlHost: process.env.MYSQL_HOST || envFile.MYSQL_HOST,
    mysqlPort: Number(process.env.MYSQL_PORT || envFile.MYSQL_PORT),
    mysqlUsername: process.env.MYSQL_USERNAME || envFile.MYSQL_USERNAME,
    mysqlPassword: process.env.MYSQL_PASSWORD || envFile.MYSQL_PASSWORD,
    mysqlDatabase: process.env.MYSQL_DATABASE || envFile.MYSQL_DATABASE
  });
  return devConfig;
}
