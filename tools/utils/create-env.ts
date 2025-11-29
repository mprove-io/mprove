import * as crypto from 'crypto';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';

function makeRandomString(length: number): string {
  let output = '';

  let charset: string =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let randomValues: Uint8Array = new Uint8Array(length);

  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    let randomIndex: number = randomValues[i] % charset.length;
    output += charset[randomIndex];
  }

  return output;
}

async function createEnvFile(): Promise<void> {
  let filePath = process.argv[2] || '.env';

  if (existsSync(filePath)) {
    console.error(`Error: ${filePath} file already exists!`);
    process.exit(1);
  }

  let aes256KeyBase64 = crypto.randomBytes(32).toString('base64');

  let dbDb = 'mprove_main';
  let dbUser = 'mprove_user';
  let dbPassword = makeRandomString(32);

  let calcPostgresPass = makeRandomString(32);
  let dwhPostgresPass = makeRandomString(32);
  let dwhMysqlRootPass = makeRandomString(32);
  let dwhClickHousePass = makeRandomString(32);

  let valkeyPass = makeRandomString(32);
  let rabbitPass = makeRandomString(32);
  let rabbitCookie = makeRandomString(32);

  let jwtSecret = makeRandomString(32);
  let specialKey = makeRandomString(32);

  let userPass = makeRandomString(9);
  let userEmail = 'user@example.com';

  let content = `
ENV_FILE_PATH=.env
ENV_FILE_SOURCE_PATH=.env
ENV_FILE_TARGET_PATH=/usr/src/app/.env

# set most recent release tag from https://github.com/mprove-io/mprove/releases
MPROVE_RELEASE_TAG=9.0.87
MPROVE_DWH_POSTGRES_TAG=9.0.87
MPROVE_DWH_MYSQL_TAG=9.0.87
MPROVE_DWH_CLICKHOUSE_TAG=9.0.87

DOCKER_CLIENT_TIMEOUT=180
COMPOSE_HTTP_TIMEOUT=180

NODE_ENV=production

COMPOSE_DB_POSTGRES_DB=${dbDb}
COMPOSE_DB_POSTGRES_USER=${dbUser}
COMPOSE_DB_POSTGRES_PASSWORD=${dbPassword}
COMPOSE_DB_VOLUME_SOURCE_PATH=mprove_data/db-main

COMPOSE_VALKEY_PASSWORD=${valkeyPass}

COMPOSE_RABBITMQ_DEFAULT_USER=rabbituser
COMPOSE_RABBITMQ_DEFAULT_PASS=${rabbitPass}
COMPOSE_RABBITMQ_ERLANG_COOKIE=${rabbitCookie}

COMPOSE_BACKEND_DEMO_PROJECT_BIGQUERY_CREDENTIALS_SOURCE_PATH=secrets/demo-project-bigquery-credentials.json
COMPOSE_BACKEND_DEMO_PROJECT_BIGQUERY_CREDENTIALS_PATH=/usr/src/app/secrets/demo-project-bigquery-credentials.json

COMPOSE_BACKEND_DEMO_PROJECT_REMOTE_PRIVATE_KEY_ENCRYPTED_SOURCE_PATH=secrets/demo-project-remote-private-key-encrypted.pem
COMPOSE_BACKEND_DEMO_PROJECT_REMOTE_PRIVATE_KEY_ENCRYPTED_PATH=/usr/src/app/secrets/demo-project-remote-private-key-encrypted.pem

COMPOSE_BACKEND_DEMO_PROJECT_REMOTE_PUBLIC_KEY_SOURCE_PATH=secrets/demo-project-remote-public-key.pem
COMPOSE_BACKEND_DEMO_PROJECT_REMOTE_PUBLIC_KEY_PATH=/usr/src/app/secrets/demo-project-remote-public-key.pem

COMPOSE_DISK_ORGANIZATIONS_VOLUME_SOURCE_PATH=mprove_data/organizations
COMPOSE_DISK_ORGANIZATIONS_VOLUME_PATH=/usr/src/app/mprove_data/organizations

COMPOSE_CALC_POSTGRES_PASSWORD=${calcPostgresPass}

COMPOSE_DWH_POSTGRES_PGDATA=/var/lib/postgresql/data/pgdata
COMPOSE_DWH_POSTGRES_PASSWORD=${dwhPostgresPass}
COMPOSE_DWH_POSTGRES_VOLUME_SOURCE_PATH=mprove_data/dwh-postgres

COMPOSE_DWH_MYSQL_ROOT_PASSWORD=${dwhMysqlRootPass}
COMPOSE_DWH_MYSQL_VOLUME_SOURCE_PATH=mprove_data/dwh-mysql

COMPOSE_DWH_TRINO_CATALOG_VOLUME_SOURCE_PATH=secrets/trino/catalog
COMPOSE_DWH_TRINO_CONFIG_VOLUME_SOURCE_PATH=secrets/trino/config.properties

COMPOSE_DWH_PRESTO_CATALOG_VOLUME_SOURCE_PATH=secrets/presto/catalog
COMPOSE_DWH_PRESTO_CONFIG_VOLUME_SOURCE_PATH=secrets/presto/config.properties

COMPOSE_DWH_CLICKHOUSE_USER=c_user
COMPOSE_DWH_CLICKHOUSE_PASSWORD=${dwhClickHousePass}
COMPOSE_DWH_CLICKHOUSE_DB=c_db
COMPOSE_DWH_CLICKHOUSE_VOLUME_SOURCE_PATH=mprove_data/dwh-clickhouse
COMPOSE_DWH_CLICKHOUSE_LOGS_VOLUME_SOURCE_PATH=mprove_data/dwh-clickhouse-logs

# dist paths are for docker compose debug config only
COMPOSE_DIST_APPS_DISK_SOURCE_PATH=dist/apps/disk
COMPOSE_DIST_APPS_BACKEND_SOURCE_PATH=dist/apps/backend
COMPOSE_DIST_APPS_BLOCKML_SOURCE_PATH=dist/apps/blockml

BACKEND_ENV=PROD
BACKEND_IS_ENCRYPT_DB=TRUE
BACKEND_IS_ENCRYPT_METADATA=FALSE
BACKEND_AES_KEY="${aes256KeyBase64}"
BACKEND_AES_KEY_TAG=1
BACKEND_PREV_AES_KEY=
BACKEND_PREV_AES_KEY_TAG=
BACKEND_VALKEY_HOST=localhost
BACKEND_VALKEY_PASSWORD=${valkeyPass}
BACKEND_RABBIT_PROTOCOL=amqp
BACKEND_RABBIT_USER=rabbituser
BACKEND_RABBIT_PASS=${rabbitPass}
BACKEND_RABBIT_HOST=rabbit
BACKEND_RABBIT_PORT=5672
BACKEND_IS_SCHEDULER=FALSE
BACKEND_JWT_SECRET=${jwtSecret}
BACKEND_SPECIAL_KEY=${specialKey}
BACKEND_ALLOW_TEST_ROUTES=FALSE
BACKEND_REGISTER_ONLY_INVITED_USERS=TRUE
BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS=FALSE
# set email that will be used for Mprove Login
BACKEND_MPROVE_ADMIN_EMAIL=${userEmail}
# set password that will be used for Mprove Login
BACKEND_MPROVE_ADMIN_INITIAL_PASSWORD=${userPass}
BACKEND_POSTGRES_DATABASE_URL=postgres://${dbUser}:${dbPassword}@db:5432/${dbDb}
BACKEND_IS_POSTGRES_TLS=FALSE
BACKEND_CALC_POSTGRES_HOST=calc-postgres
BACKEND_CALC_POSTGRES_PORT=5437
BACKEND_CALC_POSTGRES_USERNAME=postgres
BACKEND_CALC_POSTGRES_PASSWORD=${calcPostgresPass}
# BACKEND_HOST_URL is used for links in transactional emails
BACKEND_HOST_URL=http://localhost:3003
BACKEND_SEND_EMAIL_FROM_NAME=Example
BACKEND_SEND_EMAIL_FROM_ADDRESS=no-reply@example.com
BACKEND_EMAIL_TRANSPORT=SMTP
BACKEND_SMTP_PORT=465
BACKEND_SMTP_SECURE=TRUE
BACKEND_SMTP_HOST=
BACKEND_SMTP_AUTH_USER=
BACKEND_SMTP_AUTH_PASSWORD=
BACKEND_STORE_API_BLACKLISTED_HOSTS=db, valkey, rabbit, disk, blockml, backend, front, calc-postgres, dwh-postgres, dwh-mysql, dwh-trino, dwh-presto, dwh-clickhouse, mcli, integra
BACKEND_SEED_DEMO_ORG_AND_PROJECT=FALSE
BACKEND_DEMO_ORG_ID=
BACKEND_DEMO_PROJECT_ID=
BACKEND_DEMO_PROJECT_NAME=
BACKEND_DEMO_PROJECT_REMOTE_TYPE=
BACKEND_DEMO_PROJECT_GIT_URL=
BACKEND_DEMO_PROJECT_PRIVATE_KEY_ENCRYPTED_PATH=
BACKEND_DEMO_PROJECT_PUBLIC_KEY_PATH=
BACKEND_DEMO_PROJECT_PASS_PHRASE=
BACKEND_DEMO_PROJECT_DWH_POSTGRES_HOST=
BACKEND_DEMO_PROJECT_DWH_POSTGRES_PASSWORD=
BACKEND_DEMO_PROJECT_DWH_CLICKHOUSE_PASSWORD=
BACKEND_DEMO_PROJECT_DWH_MYSQL_HOST=
BACKEND_DEMO_PROJECT_DWH_MYSQL_PORT=
BACKEND_DEMO_PROJECT_DWH_MYSQL_DATABASE=
BACKEND_DEMO_PROJECT_DWH_MYSQL_USER=
BACKEND_DEMO_PROJECT_DWH_MYSQL_PASSWORD=
BACKEND_DEMO_PROJECT_DWH_TRINO_USER=
BACKEND_DEMO_PROJECT_DWH_TRINO_PASSWORD=
BACKEND_DEMO_PROJECT_DWH_PRESTO_USER=
BACKEND_DEMO_PROJECT_DWH_PRESTO_PASSWORD=
BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_ACCOUNT=
BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_WAREHOUSE=
BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_USERNAME=
BACKEND_DEMO_PROJECT_DWH_SNOWFLAKE_PASSWORD=
BACKEND_DEMO_PROJECT_DWH_MOTHERDUCK_TOKEN=
BACKEND_DEMO_PROJECT_DWH_BIGQUERY_CREDENTIALS_PATH=
BACKEND_DEMO_PROJECT_DWH_GOOGLE_API_CREDENTIALS_PATH=
BACKEND_REQUEST_IP_HEADER_A=
BACKEND_REQUEST_IP_HEADER_B=
BACKEND_THROTTLE_PUBLIC_ROUTES_BY_IP=FALSE
BACKEND_THROTTLE_PRIVATE_ROUTES_BY_USER_ID=TRUE
BACKEND_LOG_THROTTLE_TRACKER=FALSE
BACKEND_LOG_DRIZZLE_POSTGRES=FALSE
BACKEND_LOG_IS_JSON=FALSE
BACKEND_LOG_RESPONSE_ERROR=TRUE
BACKEND_LOG_RESPONSE_OK=FALSE

BLOCKML_ENV=PROD
BLOCKML_AES_KEY="${aes256KeyBase64}"
BLOCKML_RABBIT_PROTOCOL=amqp
BLOCKML_RABBIT_USER=rabbituser
BLOCKML_RABBIT_PASS=${rabbitPass}
BLOCKML_RABBIT_HOST=rabbit
BLOCKML_RABBIT_PORT=5672
BLOCKML_DATA=/mprove/mprove_data/blockml-data
BLOCKML_TESTS_DWH_POSTGRES_HOST=dwh-postgres
BLOCKML_TESTS_DWH_POSTGRES_PORT=5436
BLOCKML_TESTS_DWH_POSTGRES_USERNAME=postgres
BLOCKML_TESTS_DWH_POSTGRES_PASSWORD=${dwhPostgresPass}
BLOCKML_TESTS_DWH_POSTGRES_DATABASE_NAME=p_db
BLOCKML_LOG_IO=FALSE
BLOCKML_LOG_FUNC=ALL
BLOCKML_COPY_LOGS_TO_MODELS=FALSE
BLOCKML_LOGS_PATH=mprove_data/blockml-logs
BLOCKML_CONCURRENCY_LIMIT=0
BLOCKML_LOG_IS_JSON=FALSE
BLOCKML_LOG_RESPONSE_ERROR=FALSE
BLOCKML_LOG_RESPONSE_OK=FALSE

DISK_ENV=PROD
DISK_AES_KEY="${aes256KeyBase64}"
DISK_ORGANIZATIONS_PATH=mprove_data/organizations
DISK_RABBIT_PROTOCOL=amqp
DISK_RABBIT_USER=rabbituser
DISK_RABBIT_PASS=${rabbitPass}
DISK_RABBIT_HOST=rabbit
DISK_RABBIT_PORT=5672
DISK_LOG_IS_JSON=FALSE
DISK_LOG_RESPONSE_ERROR=FALSE
DISK_LOG_RESPONSE_OK=FALSE

MPROVE_CLI_HOST=http://localhost:3000
MPROVE_CLI_EMAIL=${userEmail}
MPROVE_CLI_PASSWORD=${userPass}
MPROVE_CLI_PROJECT_ID=DXYE72ODCP5LWPWH2EXQ
MPROVE_CLI_TEST_REPOS_PATH=/mprove/mprove_data/mcli-repos
MPROVE_CLI_TEST_REMOTE_GIT_URL=https://github.com/mprove-io/mp6.git
MPROVE_CLI_TEST_DESTINATION_URL=/mprove/mprove_data/mcli-repos/mp6
MPROVE_CLI_TEST_LOCAL_SOURCE_GIT_URL=/mprove/mprove_data/mcli-repos/mp6
MPROVE_CLI_TEST_DEV_SOURCE_GIT_URL=/mprove/mprove_data/mcli-repos/mp6
MPROVE_CLI_TEST_PUBLIC_KEY_PATH=secrets/demo-project-remote-public-key.pem
MPROVE_CLI_TEST_PRIVATE_KEY_ENCRYPTED_PATH=secrets/demo-project-remote-private-key-encrypted.pem
MPROVE_CLI_TEST_PASS_PHRASE=
MPROVE_CLI_TEST_DWH_POSTGRES_PASSWORD=${dwhPostgresPass}
`.trim();

  try {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`file "${filePath}" created successfully!`);
  } catch (e) {
    console.error(`Error creating ${filePath} file:`, e);
    process.exit(1);
  }
}

createEnvFile().catch(e => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
