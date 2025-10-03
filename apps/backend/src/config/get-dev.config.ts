import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { BackendConfig } from '~backend/config/backend-config';
import { BoolEnum } from '~common/enums/bool.enum';
import { EmailTransportEnum } from '~common/enums/email-transport.enum';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { isDefined } from '~common/functions/is-defined';

export function getDevConfig(envFilePath: any) {
  let envFile: any = {};

  if (isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let devConfig: BackendConfig = {
    mproveReleaseTag: <BackendEnvEnum>(
      (process.env.MPROVE_RELEASE_TAG || envFile.MPROVE_RELEASE_TAG)
    ),

    backendEnv: <BackendEnvEnum>(
      (process.env.BACKEND_ENV || envFile.BACKEND_ENV)
    ),

    isScheduler: <BoolEnum>(
      (process.env.BACKEND_IS_SCHEDULER || envFile.BACKEND_IS_SCHEDULER)
    ),

    demoProjectDwhBigqueryCredentialsPath:
      process.env.BACKEND_DEMO_PROJECT_DWH_BIGQUERY_CREDENTIALS_PATH ||
      envFile.BACKEND_DEMO_PROJECT_DWH_BIGQUERY_CREDENTIALS_PATH,

    demoProjectDwhGoogleApiCredentialsPath:
      process.env.BACKEND_DEMO_PROJECT_DWH_GOOGLE_API_CREDENTIALS_PATH ||
      envFile.BACKEND_DEMO_PROJECT_DWH_GOOGLE_API_CREDENTIALS_PATH,

    jwtSecret: process.env.BACKEND_JWT_SECRET || envFile.BACKEND_JWT_SECRET,

    specialKey: process.env.BACKEND_SPECIAL_KEY || envFile.BACKEND_SPECIAL_KEY,

    allowTestRoutes: <BoolEnum>(
      (process.env.BACKEND_ALLOW_TEST_ROUTES ||
        envFile.BACKEND_ALLOW_TEST_ROUTES)
    ),

    mproveAdminEmail:
      process.env.BACKEND_MPROVE_ADMIN_EMAIL ||
      envFile.BACKEND_MPROVE_ADMIN_EMAIL,

    mproveAdminInitialPassword:
      process.env.BACKEND_MPROVE_ADMIN_INITIAL_PASSWORD ||
      envFile.BACKEND_MPROVE_ADMIN_INITIAL_PASSWORD,

    demoOrgId: process.env.BACKEND_DEMO_ORG_ID || envFile.BACKEND_DEMO_ORG_ID,

    demoProjectId:
      process.env.BACKEND_DEMO_PROJECT_ID || envFile.BACKEND_DEMO_PROJECT_ID,

    demoProjectName:
      process.env.BACKEND_DEMO_PROJECT_NAME ||
      envFile.BACKEND_DEMO_PROJECT_NAME,

    demoProjectRemoteType: <ProjectRemoteTypeEnum>(
      (process.env.BACKEND_DEMO_PROJECT_REMOTE_TYPE ||
        envFile.BACKEND_DEMO_PROJECT_REMOTE_TYPE)
    ),

    demoProjectRemoteGitUrl:
      process.env.BACKEND_DEMO_PROJECT_GIT_URL ||
      envFile.BACKEND_DEMO_PROJECT_GIT_URL,

    demoProjectRemotePrivateKeyPath:
      process.env.BACKEND_DEMO_PROJECT_PRIVATE_KEY_PATH ||
      envFile.BACKEND_DEMO_PROJECT_PRIVATE_KEY_PATH,

    demoProjectRemotePublicKeyPath:
      process.env.BACKEND_DEMO_PROJECT_PUBLIC_KEY_PATH ||
      envFile.BACKEND_DEMO_PROJECT_PUBLIC_KEY_PATH,

    seedDemoOrgAndProject: <BoolEnum>(
      (process.env.BACKEND_SEED_DEMO_ORG_AND_PROJECT ||
        envFile.BACKEND_SEED_DEMO_ORG_AND_PROJECT)
    ),

    demoProjectDwhPostgresHost:
      process.env.BACKEND_DEMO_PROJECT_DWH_POSTGRES_HOST ||
      envFile.BACKEND_DEMO_PROJECT_DWH_POSTGRES_HOST,

    demoProjectDwhPostgresPassword:
      process.env.BACKEND_DEMO_PROJECT_DWH_POSTGRES_PASSWORD ||
      envFile.BACKEND_DEMO_PROJECT_DWH_POSTGRES_PASSWORD,

    demoProjectDwhClickhousePassword:
      process.env.BACKEND_DEMO_PROJECT_DWH_CLICKHOUSE_PASSWORD ||
      envFile.BACKEND_DEMO_PROJECT_DWH_CLICKHOUSE_PASSWORD,

    demoProjectDwhMysqlHost:
      process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_HOST ||
      envFile.BACKEND_DEMO_PROJECT_DWH_MYSQL_HOST,

    demoProjectDwhMysqlPort: Number(
      isDefined(process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_PORT)
        ? process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_PORT
        : envFile.BACKEND_DEMO_PROJECT_DWH_MYSQL_PORT
    ),

    demoProjectDwhMysqlDatabase:
      process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_DATABASE ||
      envFile.BACKEND_DEMO_PROJECT_DWH_MYSQL_DATABASE,

    demoProjectDwhMysqlUser:
      process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_USER ||
      envFile.BACKEND_DEMO_PROJECT_DWH_MYSQL_USER,

    demoProjectDwhMysqlPassword:
      process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_PASSWORD ||
      envFile.BACKEND_DEMO_PROJECT_DWH_MYSQL_PASSWORD,

    demoProjectDwhTrinoUser:
      process.env.BACKEND_DEMO_PROJECT_DWH_TRINO_USER ||
      envFile.BACKEND_DEMO_PROJECT_DWH_TRINO_USER,

    demoProjectDwhTrinoPassword:
      process.env.BACKEND_DEMO_PROJECT_DWH_TRINO_PASSWORD ||
      envFile.BACKEND_DEMO_PROJECT_DWH_TRINO_PASSWORD,

    demoProjectDwhPrestoUser:
      process.env.BACKEND_DEMO_PROJECT_DWH_PRESTO_USER ||
      envFile.BACKEND_DEMO_PROJECT_DWH_PRESTO_USER,

    demoProjectDwhPrestoPassword:
      process.env.BACKEND_DEMO_PROJECT_DWH_PRESTO_PASSWORD ||
      envFile.BACKEND_DEMO_PROJECT_DWH_PRESTO_PASSWORD,

    demoProjectDwhSnowflakeAccount:
      process.env.BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_ACCOUNT ||
      envFile.BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_ACCOUNT,

    demoProjectDwhSnowflakeWarehouse:
      process.env.BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_WAREHOUSE ||
      envFile.BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_WAREHOUSE,

    demoProjectDwhSnowflakeUsername:
      process.env.BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_USERNAME ||
      envFile.BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_USERNAME,

    demoProjectDwhSnowflakePassword:
      process.env.BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_PASSWORD ||
      envFile.BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_PASSWORD,

    demoProjectDwhMotherDuckToken:
      process.env.BACKEND_DEMO_PROJECT_DWH_MOTHERDUCK_TOKEN ||
      envFile.BACKEND_DEMO_PROJECT_DWH_MOTHERDUCK_TOKEN,

    calcPostgresHost:
      process.env.BACKEND_CALC_POSTGRES_HOST ||
      envFile.BACKEND_CALC_POSTGRES_HOST,

    calcPostgresPort: Number(
      isDefined(process.env.BACKEND_CALC_POSTGRES_PORT)
        ? process.env.BACKEND_CALC_POSTGRES_PORT
        : envFile.BACKEND_CALC_POSTGRES_PORT
    ),

    calcPostgresUsername:
      process.env.BACKEND_CALC_POSTGRES_USERNAME ||
      envFile.BACKEND_CALC_POSTGRES_USERNAME,

    calcPostgresPassword:
      process.env.BACKEND_CALC_POSTGRES_PASSWORD ||
      envFile.BACKEND_CALC_POSTGRES_PASSWORD,

    allowUsersToCreateOrganizations: <BoolEnum>(
      (process.env.BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS ||
        envFile.BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS)
    ),

    registerOnlyInvitedUsers: <BoolEnum>(
      (process.env.BACKEND_REGISTER_ONLY_INVITED_USERS ||
        envFile.BACKEND_REGISTER_ONLY_INVITED_USERS)
    ),

    hostUrl: process.env.BACKEND_HOST_URL || envFile.BACKEND_HOST_URL,

    sendEmailFromName:
      process.env.BACKEND_SEND_EMAIL_FROM_NAME ||
      envFile.BACKEND_SEND_EMAIL_FROM_NAME,

    sendEmailFromAddress:
      process.env.BACKEND_SEND_EMAIL_FROM_ADDRESS ||
      envFile.BACKEND_SEND_EMAIL_FROM_ADDRESS,

    emailTransport: <EmailTransportEnum>(
      (process.env.BACKEND_EMAIL_TRANSPORT || envFile.BACKEND_EMAIL_TRANSPORT)
    ),

    smtpHost: process.env.BACKEND_SMTP_HOST || envFile.BACKEND_SMTP_HOST,

    smtpPort: Number(
      isDefined(process.env.BACKEND_SMTP_PORT)
        ? process.env.BACKEND_SMTP_PORT
        : envFile.BACKEND_SMTP_PORT
    ),

    smtpSecure: <BoolEnum>(
      (process.env.BACKEND_SMTP_SECURE || envFile.BACKEND_SMTP_SECURE)
    ),

    smtpAuthUser:
      process.env.BACKEND_SMTP_AUTH_USER || envFile.BACKEND_SMTP_AUTH_USER,

    smtpAuthPassword:
      process.env.BACKEND_SMTP_AUTH_PASSWORD ||
      envFile.BACKEND_SMTP_AUTH_PASSWORD,

    //
    backendRedisHost:
      process.env.BACKEND_REDIS_HOST || envFile.BACKEND_REDIS_HOST,

    backendRedisPassword:
      process.env.BACKEND_REDIS_PASSWORD || envFile.BACKEND_REDIS_PASSWORD,

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

    backendPostgresDatabaseUrl:
      process.env.BACKEND_POSTGRES_DATABASE_URL ||
      envFile.BACKEND_POSTGRES_DATABASE_URL,

    backendIsPostgresTls: <BoolEnum>(
      (process.env.BACKEND_IS_POSTGRES_TLS || envFile.BACKEND_IS_POSTGRES_TLS)
    ),

    backendThrottlePublicRoutesByIp: <BoolEnum>(
      (process.env.BACKEND_THROTTLE_PUBLIC_ROUTES_BY_IP ||
        envFile.BACKEND_THROTTLE_PUBLIC_ROUTES_BY_IP)
    ),

    backendThrottlePrivateRoutesByUserId: <BoolEnum>(
      (process.env.BACKEND_THROTTLE_PRIVATE_ROUTES_BY_USER_ID ||
        envFile.BACKEND_THROTTLE_PRIVATE_ROUTES_BY_USER_ID)
    ),

    backendLogDrizzlePostgres: <BoolEnum>(
      (process.env.BACKEND_LOG_DRIZZLE_POSTGRES ||
        envFile.BACKEND_LOG_DRIZZLE_POSTGRES)
    ),

    backendLogIsJson: <BoolEnum>(
      (process.env.BACKEND_LOG_IS_JSON || envFile.BACKEND_LOG_IS_JSON)
    ),

    backendLogResponseError: <BoolEnum>(
      (process.env.BACKEND_LOG_RESPONSE_ERROR ||
        envFile.BACKEND_LOG_RESPONSE_ERROR)
    ),

    backendLogResponseOk: <BoolEnum>(
      (process.env.BACKEND_LOG_RESPONSE_OK || envFile.BACKEND_LOG_RESPONSE_OK)
    )
  };

  return devConfig;
}
