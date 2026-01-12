import { parse } from 'dotenv';
import * as fse from 'fs-extra';
import { BackendConfig } from '~backend/config/backend-config';
import { EmailTransportEnum } from '~common/enums/email-transport.enum';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { enumToBoolean } from '~common/functions/enum-to-boolean';
import { isDefined } from '~common/functions/is-defined';

export function getDevConfig(envFilePath: any) {
  let envFile: { [name: string]: string } = {};

  if (isDefined(envFilePath)) {
    envFile = parse(fse.readFileSync(envFilePath));
  }

  let devConfig: BackendConfig = {
    mproveReleaseTag: <BackendEnvEnum>(
      (process.env.MPROVE_RELEASE_TAG || envFile.MPROVE_RELEASE_TAG)
    ),

    isTelemetryEnabled: enumToBoolean({
      value: process.env.IS_TELEMETRY_ENABLED || envFile.IS_TELEMETRY_ENABLED,
      name: 'IS_TELEMETRY_ENABLED'
    }),

    telemetryEndpoint:
      process.env.TELEMETRY_ENDPOINT || envFile.TELEMETRY_ENDPOINT,

    telemetryHyperdxIngestApiKey:
      process.env.TELEMETRY_HYPERDX_INGEST_API_KEY ||
      envFile.TELEMETRY_HYPERDX_INGEST_API_KEY,

    otelLogLevel: process.env.OTEL_LOG_LEVEL || envFile.OTEL_LOG_LEVEL,

    backendEnv: <BackendEnvEnum>(
      (process.env.BACKEND_ENV || envFile.BACKEND_ENV)
    ),

    isEncryptDb: enumToBoolean({
      value: process.env.BACKEND_IS_ENCRYPT_DB || envFile.BACKEND_IS_ENCRYPT_DB,
      name: 'BACKEND_IS_ENCRYPT_DB'
    }),

    isEncryptMetadata: enumToBoolean({
      value:
        process.env.BACKEND_IS_ENCRYPT_METADATA ||
        envFile.BACKEND_IS_ENCRYPT_METADATA,
      name: 'BACKEND_IS_ENCRYPT_METADATA'
    }),

    aesKey: process.env.BACKEND_AES_KEY || envFile.BACKEND_AES_KEY,

    aesKeyTag: process.env.BACKEND_AES_KEY_TAG || envFile.BACKEND_AES_KEY_TAG,

    prevAesKey:
      process.env.BACKEND_PREV_AES_KEY || envFile.BACKEND_PREV_AES_KEY,

    prevAesKeyTag:
      process.env.BACKEND_PREV_AES_KEY_TAG || envFile.BACKEND_PREV_AES_KEY_TAG,

    totalDiskShards: isDefined(process.env.BACKEND_TOTAL_DISK_SHARDS)
      ? Number(process.env.BACKEND_TOTAL_DISK_SHARDS)
      : isDefined(envFile.BACKEND_TOTAL_DISK_SHARDS)
        ? Number(envFile.BACKEND_TOTAL_DISK_SHARDS)
        : undefined,

    rpcDiskTimeoutMs: isDefined(process.env.BACKEND_RPC_DISK_TIMEOUT_MS)
      ? Number(process.env.BACKEND_RPC_DISK_TIMEOUT_MS)
      : isDefined(envFile.BACKEND_RPC_DISK_TIMEOUT_MS)
        ? Number(envFile.BACKEND_RPC_DISK_TIMEOUT_MS)
        : undefined,

    rpcBlockmlTimeoutMs: isDefined(process.env.BACKEND_RPC_BLOCKML_TIMEOUT_MS)
      ? Number(process.env.BACKEND_RPC_BLOCKML_TIMEOUT_MS)
      : isDefined(envFile.BACKEND_RPC_BLOCKML_TIMEOUT_MS)
        ? Number(envFile.BACKEND_RPC_BLOCKML_TIMEOUT_MS)
        : undefined,

    isScheduler: enumToBoolean({
      value: process.env.BACKEND_IS_SCHEDULER || envFile.BACKEND_IS_SCHEDULER,
      name: 'BACKEND_IS_SCHEDULER'
    }),

    demoProjectDwhBigqueryCredentialsPath:
      process.env.BACKEND_DEMO_PROJECT_DWH_BIGQUERY_CREDENTIALS_PATH ||
      envFile.BACKEND_DEMO_PROJECT_DWH_BIGQUERY_CREDENTIALS_PATH,

    demoProjectDwhGoogleApiCredentialsPath:
      process.env.BACKEND_DEMO_PROJECT_DWH_GOOGLE_API_CREDENTIALS_PATH ||
      envFile.BACKEND_DEMO_PROJECT_DWH_GOOGLE_API_CREDENTIALS_PATH,

    jwtSecret: process.env.BACKEND_JWT_SECRET || envFile.BACKEND_JWT_SECRET,

    specialKey: process.env.BACKEND_SPECIAL_KEY || envFile.BACKEND_SPECIAL_KEY,

    allowTestRoutes: enumToBoolean({
      value:
        process.env.BACKEND_ALLOW_TEST_ROUTES ||
        envFile.BACKEND_ALLOW_TEST_ROUTES,
      name: 'BACKEND_ALLOW_TEST_ROUTES'
    }),

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

    demoProjectRemotePrivateKeyEncryptedPath:
      process.env.BACKEND_DEMO_PROJECT_PRIVATE_KEY_ENCRYPTED_PATH ||
      envFile.BACKEND_DEMO_PROJECT_PRIVATE_KEY_ENCRYPTED_PATH,

    demoProjectRemotePublicKeyPath:
      process.env.BACKEND_DEMO_PROJECT_PUBLIC_KEY_PATH ||
      envFile.BACKEND_DEMO_PROJECT_PUBLIC_KEY_PATH,

    demoProjectRemotePassPhrase:
      process.env.BACKEND_DEMO_PROJECT_PASS_PHRASE ||
      envFile.BACKEND_DEMO_PROJECT_PASS_PHRASE,

    storeApiBlockHosts:
      process.env.BACKEND_STORE_API_BLOCK_HOSTS ||
      envFile.BACKEND_STORE_API_BLOCK_HOSTS,

    storeApiAllowHosts:
      process.env.BACKEND_STORE_API_ALLOW_HOSTS ||
      envFile.BACKEND_STORE_API_ALLOW_HOSTS,

    seedDemoOrgAndProject: enumToBoolean({
      value:
        process.env.BACKEND_SEED_DEMO_ORG_AND_PROJECT ||
        envFile.BACKEND_SEED_DEMO_ORG_AND_PROJECT,
      name: 'BACKEND_SEED_DEMO_ORG_AND_PROJECT'
    }),

    demoProjectDwhPostgresHost:
      process.env.BACKEND_DEMO_PROJECT_DWH_POSTGRES_HOST ||
      envFile.BACKEND_DEMO_PROJECT_DWH_POSTGRES_HOST,

    demoProjectDwhPostgresUser:
      process.env.BACKEND_DEMO_PROJECT_DWH_POSTGRES_USER ||
      envFile.BACKEND_DEMO_PROJECT_DWH_POSTGRES_USER,

    demoProjectDwhPostgresPassword:
      process.env.BACKEND_DEMO_PROJECT_DWH_POSTGRES_PASSWORD ||
      envFile.BACKEND_DEMO_PROJECT_DWH_POSTGRES_PASSWORD,

    // demoProjectDwhClickhousePassword:
    //   process.env.BACKEND_DEMO_PROJECT_DWH_CLICKHOUSE_PASSWORD ||
    //   envFile.BACKEND_DEMO_PROJECT_DWH_CLICKHOUSE_PASSWORD,

    demoProjectDwhMysqlHost:
      process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_HOST ||
      envFile.BACKEND_DEMO_PROJECT_DWH_MYSQL_HOST,

    demoProjectDwhMysqlPort: isDefined(
      process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_PORT
    )
      ? Number(process.env.BACKEND_DEMO_PROJECT_DWH_MYSQL_PORT)
      : isDefined(envFile.BACKEND_DEMO_PROJECT_DWH_MYSQL_PORT)
        ? Number(envFile.BACKEND_DEMO_PROJECT_DWH_MYSQL_PORT)
        : undefined,

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

    calcPostgresPort: isDefined(process.env.BACKEND_CALC_POSTGRES_PORT)
      ? Number(process.env.BACKEND_CALC_POSTGRES_PORT)
      : isDefined(envFile.BACKEND_CALC_POSTGRES_PORT)
        ? Number(envFile.BACKEND_CALC_POSTGRES_PORT)
        : undefined,

    calcPostgresUsername:
      process.env.BACKEND_CALC_POSTGRES_USERNAME ||
      envFile.BACKEND_CALC_POSTGRES_USERNAME,

    calcPostgresPassword:
      process.env.BACKEND_CALC_POSTGRES_PASSWORD ||
      envFile.BACKEND_CALC_POSTGRES_PASSWORD,

    allowUsersToCreateOrganizations: enumToBoolean({
      value:
        process.env.BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS ||
        envFile.BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS,
      name: 'BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS'
    }),

    registerOnlyInvitedUsers: enumToBoolean({
      value:
        process.env.BACKEND_REGISTER_ONLY_INVITED_USERS ||
        envFile.BACKEND_REGISTER_ONLY_INVITED_USERS,
      name: 'BACKEND_REGISTER_ONLY_INVITED_USERS'
    }),

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

    smtpPort: isDefined(process.env.BACKEND_SMTP_PORT)
      ? Number(process.env.BACKEND_SMTP_PORT)
      : isDefined(envFile.BACKEND_SMTP_PORT)
        ? Number(envFile.BACKEND_SMTP_PORT)
        : undefined,

    smtpSecure: enumToBoolean({
      value: process.env.BACKEND_SMTP_SECURE || envFile.BACKEND_SMTP_SECURE,
      name: 'BACKEND_SMTP_SECURE'
    }),

    smtpAuthUser:
      process.env.BACKEND_SMTP_AUTH_USER || envFile.BACKEND_SMTP_AUTH_USER,

    smtpAuthPassword:
      process.env.BACKEND_SMTP_AUTH_PASSWORD ||
      envFile.BACKEND_SMTP_AUTH_PASSWORD,

    backendIsForwardTelemetryEnabled: enumToBoolean({
      value:
        process.env.BACKEND_IS_FORWARD_TELEMETRY_ENABLED ||
        envFile.BACKEND_IS_FORWARD_TELEMETRY_ENABLED,
      name: 'BACKEND_IS_FORWARD_TELEMETRY_ENABLED'
    }),

    backendValkeyHost:
      process.env.BACKEND_VALKEY_HOST || envFile.BACKEND_VALKEY_HOST,

    backendValkeyPassword:
      process.env.BACKEND_VALKEY_PASSWORD || envFile.BACKEND_VALKEY_PASSWORD,

    backendPostgresDatabaseUrl:
      process.env.BACKEND_POSTGRES_DATABASE_URL ||
      envFile.BACKEND_POSTGRES_DATABASE_URL,

    backendIsPostgresTls: enumToBoolean({
      value:
        process.env.BACKEND_IS_POSTGRES_TLS || envFile.BACKEND_IS_POSTGRES_TLS,
      name: 'BACKEND_IS_POSTGRES_TLS'
    }),

    backendRequestIpHeaderA:
      process.env.BACKEND_REQUEST_IP_HEADER_A ||
      envFile.BACKEND_REQUEST_IP_HEADER_A,

    backendRequestIpHeaderB:
      process.env.BACKEND_REQUEST_IP_HEADER_B ||
      envFile.BACKEND_REQUEST_IP_HEADER_B,

    backendThrottlePublicRoutesByIp: enumToBoolean({
      value:
        process.env.BACKEND_THROTTLE_PUBLIC_ROUTES_BY_IP ||
        envFile.BACKEND_THROTTLE_PUBLIC_ROUTES_BY_IP,
      name: 'BACKEND_THROTTLE_PUBLIC_ROUTES_BY_IP'
    }),

    backendThrottlePrivateRoutesByUserId: enumToBoolean({
      value:
        process.env.BACKEND_THROTTLE_PRIVATE_ROUTES_BY_USER_ID ||
        envFile.BACKEND_THROTTLE_PRIVATE_ROUTES_BY_USER_ID,
      name: 'BACKEND_THROTTLE_PRIVATE_ROUTES_BY_USER_ID'
    }),

    backendLogThrottleTracker: enumToBoolean({
      value:
        process.env.BACKEND_LOG_THROTTLE_TRACKER ||
        envFile.BACKEND_LOG_THROTTLE_TRACKER,
      name: 'BACKEND_LOG_THROTTLE_TRACKER'
    }),

    backendLogDrizzlePostgres: enumToBoolean({
      value:
        process.env.BACKEND_LOG_DRIZZLE_POSTGRES ||
        envFile.BACKEND_LOG_DRIZZLE_POSTGRES,
      name: 'BACKEND_LOG_DRIZZLE_POSTGRES'
    }),

    backendLogIsJson: enumToBoolean({
      value: process.env.BACKEND_LOG_IS_JSON || envFile.BACKEND_LOG_IS_JSON,
      name: 'BACKEND_LOG_IS_JSON'
    }),

    backendLogResponseError: enumToBoolean({
      value:
        process.env.BACKEND_LOG_RESPONSE_ERROR ||
        envFile.BACKEND_LOG_RESPONSE_ERROR,
      name: 'BACKEND_LOG_RESPONSE_ERROR'
    }),

    backendLogResponseOk: enumToBoolean({
      value:
        process.env.BACKEND_LOG_RESPONSE_OK || envFile.BACKEND_LOG_RESPONSE_OK,
      name: 'BACKEND_LOG_RESPONSE_OK'
    })
  };

  return devConfig;
}
