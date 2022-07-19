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

  let devConfig: interfaces.Config = {
    backendEnv: <enums.BackendEnvEnum>(
      (process.env.BACKEND_ENV || envFile.BACKEND_ENV)
    ),
    isScheduler: <common.BoolEnum>(
      (process.env.BACKEND_IS_SCHEDULER || envFile.BACKEND_IS_SCHEDULER)
    ),
    backendBigqueryPath:
      process.env.BACKEND_BIGQUERY_PATH || envFile.BACKEND_BIGQUERY_PATH,
    jwtSecret: process.env.BACKEND_JWT_SECRET || envFile.BACKEND_JWT_SECRET,
    specialKey: process.env.BACKEND_SPECIAL_KEY || envFile.BACKEND_SPECIAL_KEY,
    allowTestRoutes: <common.BoolEnum>(
      (process.env.BACKEND_ALLOW_TEST_ROUTES ||
        envFile.BACKEND_ALLOW_TEST_ROUTES)
    ),
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
    backendRabbitUser:
      process.env.BACKEND_RABBIT_USER || envFile.BACKEND_RABBIT_USER,
    backendRabbitPass:
      process.env.BACKEND_RABBIT_PASS || envFile.BACKEND_RABBIT_PASS,
    backendRabbitHost:
      process.env.BACKEND_RABBIT_HOST || envFile.BACKEND_RABBIT_HOST,
    backendRabbitPort:
      process.env.BACKEND_RABBIT_PORT || envFile.BACKEND_RABBIT_PORT,
    backendRabbitProtocol:
      process.env.BACKEND_RABBIT_PROTOCOL || envFile.BACKEND_RABBIT_PROTOCOL,

    backendMysqlHost:
      process.env.BACKEND_MYSQL_HOST || envFile.BACKEND_MYSQL_HOST,
    backendMysqlPort: Number(
      process.env.BACKEND_MYSQL_PORT || envFile.BACKEND_MYSQL_PORT
    ),
    backendMysqlUsername:
      process.env.BACKEND_MYSQL_USERNAME || envFile.BACKEND_MYSQL_USERNAME,
    backendMysqlPassword:
      process.env.BACKEND_MYSQL_PASSWORD || envFile.BACKEND_MYSQL_PASSWORD,
    backendMysqlDatabase:
      process.env.BACKEND_MYSQL_DATABASE || envFile.BACKEND_MYSQL_DATABASE,

    backendLogIsColor: <common.BoolEnum>(
      (process.env.BACKEND_LOG_IS_COLOR || envFile.BACKEND_LOG_IS_COLOR)
    ),
    backendLogResponseError: <common.BoolEnum>(
      (process.env.BACKEND_LOG_RESPONSE_ERROR ||
        envFile.BACKEND_LOG_RESPONSE_ERROR)
    ),
    backendLogResponseOk: <common.BoolEnum>(
      (process.env.BACKEND_LOG_RESPONSE_OK || envFile.BACKEND_LOG_RESPONSE_OK)
    ),
    backendLogOnSender: <common.BoolEnum>(
      (process.env.BACKEND_LOG_ON_SENDER || envFile.BACKEND_LOG_ON_SENDER)
    ),
    backendLogOnResponser: <common.BoolEnum>(
      (process.env.BACKEND_LOG_ON_RESPONSER || envFile.BACKEND_LOG_ON_RESPONSER)
    )
  };
  return devConfig;
}
