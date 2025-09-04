import { randomBytes } from 'crypto';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';

function makeRandomString(length: number): string {
  return randomBytes(length).toString('hex').slice(0, length);
}

async function createEnvFile(): Promise<void> {
  let filePath = process.argv[2] || '.env';

  if (existsSync(filePath)) {
    console.error(`Error: ${filePath} file already exists!`);
    process.exit(1);
  }

  let dbPgUserPass = makeRandomString(32);
  let dbPgPostgresPass = makeRandomString(32);

  let dwhPostgresPass = makeRandomString(32);
  let dwhMysqlRootPass = makeRandomString(32);
  let dwhClickHousePass = makeRandomString(32);

  let redisPass = makeRandomString(32);
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
MPROVE_RELEASE_TAG=9.0.85
MPROVE_DWH_POSTGRES_TAG=9.0.85

REDIS_RELEASE_TAG=7.2.4
RABBIT_RELEASE_TAG=3.10.6-management

DOCKER_CLIENT_TIMEOUT=180
COMPOSE_HTTP_TIMEOUT=180

NODE_ENV=production

COMPOSE_DB_MYSQL_DATABASE=mprovedb
COMPOSE_DB_MYSQL_ROOT_PASSWORD=${dwhMysqlRootPass}
COMPOSE_DB_MYSQL_VOLUME_SOURCE_PATH=mprove_data/dwh-mysql

COMPOSE_DB_PG_POSTGRESQL_DATABASE=mprove_main
COMPOSE_DB_PG_POSTGRESQL_USERNAME=mprove_user
COMPOSE_DB_PG_POSTGRESQL_PASSWORD=${dbPgUserPass}
COMPOSE_DB_PG_POSTGRESQL_POSTGRES_PASSWORD=${dbPgPostgresPass}
COMPOSE_DB_PG_VOLUME_SOURCE_PATH=mprove_data/db-main

COMPOSE_REDIS_PASSWORD=${redisPass}
COMPOSE_REDIS_VOLUME_SOURCE_PATH=mprove_data/redis

COMPOSE_RABBITMQ_DEFAULT_USER=rabbituser
COMPOSE_RABBITMQ_DEFAULT_PASS=${rabbitPass}
COMPOSE_RABBITMQ_ERLANG_COOKIE=${rabbitCookie}

COMPOSE_BACKEND_FIRST_PROJECT_BIGQUERY_CREDENTIALS_SOURCE_PATH=secrets/first-project-bigquery-credentials.json
COMPOSE_BACKEND_FIRST_PROJECT_BIGQUERY_CREDENTIALS_PATH=/usr/src/app/secrets/first-project-bigquery-credentials.json

COMPOSE_BACKEND_FIRST_PROJECT_REMOTE_PRIVATE_KEY_SOURCE_PATH=secrets/first-project-remote-private-key.pem
COMPOSE_BACKEND_FIRST_PROJECT_REMOTE_PRIVATE_KEY_PATH=/usr/src/app/secrets/first-project-remote-private-key.pem

COMPOSE_BACKEND_FIRST_PROJECT_REMOTE_PUBLIC_KEY_SOURCE_PATH=secrets/first-project-remote-public-key.pem
COMPOSE_BACKEND_FIRST_PROJECT_REMOTE_PUBLIC_KEY_PATH=/usr/src/app/secrets/first-project-remote-public-key.pem

COMPOSE_DISK_ORGANIZATIONS_VOLUME_SOURCE_PATH=mprove_data/organizations
COMPOSE_DISK_ORGANIZATIONS_VOLUME_PATH=/usr/src/app/mprove_data/organizations

COMPOSE_DWH_POSTGRES_PGDATA=/var/lib/postgresql/data/pgdata
COMPOSE_DWH_POSTGRES_PASSWORD=${dwhPostgresPass}
COMPOSE_DWH_POSTGRES_VOLUME_SOURCE_PATH=mprove_data/dwh-postgres

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
BACKEND_MYSQL_DATABASE=mprovedb
BACKEND_MYSQL_PASSWORD=${dwhMysqlRootPass}
BACKEND_MYSQL_HOST=db
BACKEND_MYSQL_PORT=3306
BACKEND_MYSQL_USERNAME=root
BACKEND_REDIS_HOST=localhost
BACKEND_REDIS_PASSWORD=${redisPass}
BACKEND_RABBIT_PROTOCOL=amqp
BACKEND_RABBIT_USER=rabbituser
BACKEND_RABBIT_PASS=${rabbitPass}
BACKEND_RABBIT_HOST=rabbit
BACKEND_RABBIT_PORT=5672
BACKEND_IS_SCHEDULER=FALSE
BACKEND_JWT_SECRET=${jwtSecret}
BACKEND_SPECIAL_KEY=${specialKey}
BACKEND_ALLOW_TEST_ROUTES=FALSE
# set email that will be used for Mprove Login
BACKEND_FIRST_USER_EMAIL=${userEmail}
# set password that will be used for Mprove Login
BACKEND_FIRST_USER_PASSWORD=${userPass}
BACKEND_FIRST_ORG_ID=AWNCAHWLFQTQJYCH3ZSE
BACKEND_FIRST_PROJECT_ID=DXYE72ODCP5LWPWH2EXQ
BACKEND_FIRST_PROJECT_NAME=p1
BACKEND_FIRST_PROJECT_REMOTE_TYPE=Managed
BACKEND_FIRST_PROJECT_GIT_URL=
BACKEND_FIRST_PROJECT_PRIVATE_KEY_PATH=secrets/first-project-remote-private-key.pem
BACKEND_FIRST_PROJECT_PUBLIC_KEY_PATH=secrets/first-project-remote-public-key.pem
BACKEND_FIRST_PROJECT_SEED_CONNECTIONS=TRUE
BACKEND_FIRST_PROJECT_DWH_POSTGRES_HOST=dwh-postgres
BACKEND_FIRST_PROJECT_DWH_POSTGRES_PASSWORD=${dwhPostgresPass}
BACKEND_FIRST_PROJECT_DWH_CLICKHOUSE_PASSWORD=${dwhClickHousePass}
BACKEND_FIRST_PROJECT_DWH_BIGQUERY_CREDENTIALS_PATH=secrets/first-project-bigquery-credentials.json
BACKEND_FIRST_PROJECT_DWH_SNOWFLAKE_ACCOUNT=
BACKEND_FIRST_PROJECT_DWH_SNOWFLAKE_WAREHOUSE=
BACKEND_FIRST_PROJECT_DWH_SNOWFLAKE_USERNAME=
BACKEND_FIRST_PROJECT_DWH_SNOWFLAKE_PASSWORD=
BACKEND_ALLOW_USERS_TO_CREATE_ORGANIZATIONS=FALSE
BACKEND_REGISTER_ONLY_INVITED_USERS=TRUE
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
BACKEND_POSTGRES_DATABASE_URL=postgres://mprove_user:${dbPgUserPass}@db:5432/mprove_main
BACKEND_IS_POSTGRES_TLS=FALSE
BACKEND_LOG_DRIZZLE_POSTGRES=FALSE
BACKEND_LOG_IS_JSON=FALSE
BACKEND_LOG_RESPONSE_ERROR=FALSE
BACKEND_LOG_RESPONSE_OK=FALSE

BLOCKML_ENV=PROD
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
MPROVE_CLI_TEST_PRIVATE_KEY_PATH=secrets/first-project-remote-private-key.pem
MPROVE_CLI_TEST_PUBLIC_KEY_PATH=secrets/first-project-remote-public-key.pem
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
