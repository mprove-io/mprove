import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { common } from '~backend/barrels/common';
import { enums } from '~backend/barrels/enums';
import { interfaces } from '~backend/barrels/interfaces';

export function getDevConfig(envFilePath: any) {
  let env = common.isDefined(envFilePath)
    ? parse(fse.readFileSync(envFilePath))
    : process.env;

  let commonConfig: common.Config = common.getCommonConfig(env);

  let devConfig: interfaces.Config = Object.assign({}, commonConfig, <
    interfaces.Config
  >{
    backendEnv: <enums.BackendEnvEnum>env.BACKEND_ENV,
    isScheduler: <common.BoolEnum>env.BACKEND_IS_SCHEDULER,
    mDataBigqueryPath: env.M_DATA_BIGQUERY_PATH,
    jwtSecret: env.BACKEND_JWT_SECRET,
    specialKey: env.BACKEND_SPECIAL_KEY,
    allowTestRoutes: env.BACKEND_ALLOW_TEST_ROUTES,
    firstUserEmail: env.BACKEND_FIRST_USER_EMAIL,
    firstUserPassword: env.BACKEND_FIRST_USER_PASSWORD,
    firstOrgId: env.BACKEND_FIRST_ORG_ID,
    firstProjectId: env.BACKEND_FIRST_PROJECT_ID,
    registerOnlyInvitedUsers: <common.BoolEnum>(
      env.BACKEND_REGISTER_ONLY_INVITED_USERS
    ),
    //
    sendEmail: <common.BoolEnum>env.BACKEND_SEND_EMAIL,
    hostUrl: env.BACKEND_HOST_URL,
    sendEmailFromName: env.BACKEND_SEND_EMAIL_FROM_NAME,
    sendEmailFromAddress: env.BACKEND_SEND_EMAIL_FROM_ADDRESS,
    emailTransport: <enums.EmailTransportEnum>env.BACKEND_EMAIL_TRANSPORT,
    //
    mailgunActiveApiKey: env.BACKEND_MAILGUN_ACTIVE_API_KEY,
    mailgunDomain: env.BACKEND_MAILGUN_DOMAIN,
    //
    smtpHost: env.BACKEND_SMTP_HOST,
    smtpPort: Number(env.BACKEND_SMTP_PORT),
    smtpSecure: <common.BoolEnum>env.BACKEND_SMTP_SECURE,
    smtpAuthUser: env.BACKEND_SMTP_AUTH_USER,
    smtpAuthPassword: env.BACKEND_SMTP_AUTH_PASSWORD,
    //
    rabbitUser: env.RABBIT_USER,
    rabbitPass: env.RABBIT_PASS,
    rabbitHost: env.RABBIT_HOST,
    rabbitPort: env.RABBIT_PORT,
    rabbitProtocol: env.RABBIT_PROTOCOL,

    mysqlHost: env.MYSQL_HOST,
    mysqlPort: Number(env.MYSQL_PORT),
    mysqlUsername: env.MYSQL_USERNAME,
    mysqlPassword: env.MYSQL_PASSWORD,
    mysqlDatabase: env.MYSQL_DATABASE
  });
  return devConfig;
}
