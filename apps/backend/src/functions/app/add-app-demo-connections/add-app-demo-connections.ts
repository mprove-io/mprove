import type { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import fse from 'fs-extra';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ConnectionTab,
  connectionsTable
} from '#backend/drizzle/postgres/tables/connections';
import { makeConnection } from '#backend/functions/db/connections/make-connection/make-connection';
import type { DbService } from '#backend/services/db/db.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';

export async function addAppDemoConnections(item: {
  demoProjectId: string;
  cs: ConfigService<BackendConfig>;
  db: DbService;
}): Promise<ConnectionTab[]> {
  let { demoProjectId, cs, db } = item;

  let connections: ConnectionTab[] = [];

  let isC1ConnectionExist: boolean = await db.connections.isExistUnwrap({
    where: and(
      eq(connectionsTable.projectId, demoProjectId),
      eq(connectionsTable.envId, PROJECT_ENV_PROD),
      eq(connectionsTable.connectionId, 'c1_postgres')
    )
  });

  let demoProjectDwhPostgresPassword: BackendConfig['demoProjectDwhPostgresPassword'] =
    cs.get<BackendConfig['demoProjectDwhPostgresPassword']>(
      'demoProjectDwhPostgresPassword'
    );

  if (
    !isC1ConnectionExist &&
    isDefinedAndNotEmpty(demoProjectDwhPostgresPassword)
  ) {
    let c1: ConnectionTab = makeConnection({
      projectId: demoProjectId,
      envId: PROJECT_ENV_PROD,
      connectionId: 'c1_postgres',
      type: 'PostgreSQL',
      options: {
        postgres: {
          host: cs.get<BackendConfig['demoProjectDwhPostgresHost']>(
            'demoProjectDwhPostgresHost'
          ),
          port: 5436,
          database: 'p_db',
          username: cs.get<BackendConfig['demoProjectDwhPostgresUser']>(
            'demoProjectDwhPostgresUser'
          ),
          password: demoProjectDwhPostgresPassword,
          isSSL: false
        }
      }
    });

    connections.push(c1);
  }

  let isC3ConnectionExist: boolean = await db.connections.isExistUnwrap({
    where: and(
      eq(connectionsTable.projectId, demoProjectId),
      eq(connectionsTable.envId, PROJECT_ENV_PROD),
      eq(connectionsTable.connectionId, 'c3_bigquery')
    )
  });

  let demoProjectDwhBigqueryCredentialsPath: BackendConfig['demoProjectDwhBigqueryCredentialsPath'] =
    cs.get<BackendConfig['demoProjectDwhBigqueryCredentialsPath']>(
      'demoProjectDwhBigqueryCredentialsPath'
    );

  if (
    !isC3ConnectionExist &&
    isDefinedAndNotEmpty(demoProjectDwhBigqueryCredentialsPath)
  ) {
    let bigqueryTestCredentials: Record<string, string> = JSON.parse(
      fse.readFileSync(demoProjectDwhBigqueryCredentialsPath).toString()
    );

    let c3: ConnectionTab = makeConnection({
      projectId: demoProjectId,
      envId: PROJECT_ENV_PROD,
      connectionId: 'c3_bigquery',
      type: 'BigQuery',
      options: {
        bigquery: {
          serviceAccountCredentials: bigqueryTestCredentials,
          googleCloudProject: bigqueryTestCredentials?.project_id,
          googleCloudClientEmail: bigqueryTestCredentials?.client_email,
          bigqueryQuerySizeLimitGb: 1
        }
      }
    });

    connections.push(c3);
  }

  let isC4ConnectionExist: boolean = await db.connections.isExistUnwrap({
    where: and(
      eq(connectionsTable.projectId, demoProjectId),
      eq(connectionsTable.envId, PROJECT_ENV_PROD),
      eq(connectionsTable.connectionId, 'c4_snowflake')
    )
  });

  let demoProjectDwhSnowflakeAccount: BackendConfig['demoProjectDwhSnowflakeAccount'] =
    cs.get<BackendConfig['demoProjectDwhSnowflakeAccount']>(
      'demoProjectDwhSnowflakeAccount'
    );

  if (
    !isC4ConnectionExist &&
    isDefinedAndNotEmpty(demoProjectDwhSnowflakeAccount)
  ) {
    let c4: ConnectionTab = makeConnection({
      projectId: demoProjectId,
      envId: PROJECT_ENV_PROD,
      connectionId: 'c4_snowflake',
      type: 'SnowFlake',
      options: {
        snowflake: {
          account: demoProjectDwhSnowflakeAccount,
          warehouse: cs.get<BackendConfig['demoProjectDwhSnowflakeWarehouse']>(
            'demoProjectDwhSnowflakeWarehouse'
          ),
          database: undefined,
          username: cs.get<BackendConfig['demoProjectDwhSnowflakeUsername']>(
            'demoProjectDwhSnowflakeUsername'
          ),
          password: cs.get<BackendConfig['demoProjectDwhSnowflakePassword']>(
            'demoProjectDwhSnowflakePassword'
          )
        }
      }
    });

    connections.push(c4);
  }

  let isC5ConnectionExist: boolean = await db.connections.isExistUnwrap({
    where: and(
      eq(connectionsTable.projectId, demoProjectId),
      eq(connectionsTable.envId, PROJECT_ENV_PROD),
      eq(connectionsTable.connectionId, 'c5_duckdb')
    )
  });

  let demoProjectDwhMotherDuckToken: BackendConfig['demoProjectDwhMotherDuckToken'] =
    cs.get<BackendConfig['demoProjectDwhMotherDuckToken']>(
      'demoProjectDwhMotherDuckToken'
    );

  if (
    !isC5ConnectionExist &&
    isDefinedAndNotEmpty(demoProjectDwhMotherDuckToken)
  ) {
    let c5: ConnectionTab = makeConnection({
      projectId: demoProjectId,
      envId: PROJECT_ENV_PROD,
      connectionId: 'c5_duckdb',
      type: 'MotherDuck',
      options: {
        motherduck: {
          motherduckToken: demoProjectDwhMotherDuckToken,
          database: 'db1',
          attachModeSingle: true,
          accessModeReadOnly: true
        }
      }
    });

    connections.push(c5);
  }

  let isC6ConnectionExist: boolean = await db.connections.isExistUnwrap({
    where: and(
      eq(connectionsTable.projectId, demoProjectId),
      eq(connectionsTable.envId, PROJECT_ENV_PROD),
      eq(connectionsTable.connectionId, 'c6_mysql')
    )
  });

  let demoProjectDwhMysqlPassword: BackendConfig['demoProjectDwhMysqlPassword'] =
    cs.get<BackendConfig['demoProjectDwhMysqlPassword']>(
      'demoProjectDwhMysqlPassword'
    );

  if (
    !isC6ConnectionExist &&
    isDefinedAndNotEmpty(demoProjectDwhMysqlPassword)
  ) {
    let c6: ConnectionTab = makeConnection({
      projectId: demoProjectId,
      envId: PROJECT_ENV_PROD,
      connectionId: 'c6_mysql',
      type: 'MySQL',
      options: {
        mysql: {
          host: cs.get<BackendConfig['demoProjectDwhMysqlHost']>(
            'demoProjectDwhMysqlHost'
          ),
          port: cs.get<BackendConfig['demoProjectDwhMysqlPort']>(
            'demoProjectDwhMysqlPort'
          ),
          database: cs.get<BackendConfig['demoProjectDwhMysqlDatabase']>(
            'demoProjectDwhMysqlDatabase'
          ),
          user: cs.get<BackendConfig['demoProjectDwhMysqlUser']>(
            'demoProjectDwhMysqlUser'
          ),
          password: demoProjectDwhMysqlPassword
        }
      }
    });

    connections.push(c6);
  }

  let isC7ConnectionExist: boolean = await db.connections.isExistUnwrap({
    where: and(
      eq(connectionsTable.projectId, demoProjectId),
      eq(connectionsTable.envId, PROJECT_ENV_PROD),
      eq(connectionsTable.connectionId, 'c7_google')
    )
  });

  let demoProjectDwhGoogleApiCredentialsPath: BackendConfig['demoProjectDwhGoogleApiCredentialsPath'] =
    cs.get<BackendConfig['demoProjectDwhGoogleApiCredentialsPath']>(
      'demoProjectDwhGoogleApiCredentialsPath'
    );

  if (
    !isC7ConnectionExist &&
    isDefinedAndNotEmpty(demoProjectDwhGoogleApiCredentialsPath)
  ) {
    let googleApiTestCredentials: Record<string, string> = JSON.parse(
      fse.readFileSync(demoProjectDwhGoogleApiCredentialsPath).toString()
    );

    let c7: ConnectionTab = makeConnection({
      projectId: demoProjectId,
      envId: PROJECT_ENV_PROD,
      connectionId: 'c7_google',
      type: 'GoogleApi',
      options: {
        storeGoogleApi: {
          baseUrl: 'https://analyticsdata.googleapis.com',
          headers: [],
          googleAuthScopes: [
            'https://www.googleapis.com/auth/analytics.readonly'
          ],
          serviceAccountCredentials: googleApiTestCredentials,
          googleCloudProject: googleApiTestCredentials?.project_id,
          googleCloudClientEmail: googleApiTestCredentials?.client_email,
          googleAccessToken: undefined,
          googleAccessTokenExpiryDate: undefined
        }
      }
    });

    connections.push(c7);
  }

  let isC8ConnectionExist: boolean = await db.connections.isExistUnwrap({
    where: and(
      eq(connectionsTable.projectId, demoProjectId),
      eq(connectionsTable.envId, PROJECT_ENV_PROD),
      eq(connectionsTable.connectionId, 'c8_trino')
    )
  });

  let demoProjectDwhTrinoUser: BackendConfig['demoProjectDwhTrinoUser'] =
    cs.get<BackendConfig['demoProjectDwhTrinoUser']>('demoProjectDwhTrinoUser');

  if (!isC8ConnectionExist && isDefinedAndNotEmpty(demoProjectDwhTrinoUser)) {
    let c8: ConnectionTab = makeConnection({
      projectId: demoProjectId,
      envId: PROJECT_ENV_PROD,
      connectionId: 'c8_trino',
      type: 'Trino',
      options: {
        trino: {
          server: 'http://dwh-trino:8081',
          catalog: undefined,
          schema: undefined,
          user: demoProjectDwhTrinoUser,
          password: cs.get<BackendConfig['demoProjectDwhTrinoPassword']>(
            'demoProjectDwhTrinoPassword'
          ),
          extraConfig: undefined
        }
      }
    });

    connections.push(c8);
  }

  let isC9ConnectionExist: boolean = await db.connections.isExistUnwrap({
    where: and(
      eq(connectionsTable.projectId, demoProjectId),
      eq(connectionsTable.envId, PROJECT_ENV_PROD),
      eq(connectionsTable.connectionId, 'c9_presto')
    )
  });

  let demoProjectDwhPrestoUser: BackendConfig['demoProjectDwhPrestoUser'] =
    cs.get<BackendConfig['demoProjectDwhPrestoUser']>(
      'demoProjectDwhPrestoUser'
    );

  if (!isC9ConnectionExist && isDefinedAndNotEmpty(demoProjectDwhPrestoUser)) {
    let c9: ConnectionTab = makeConnection({
      projectId: demoProjectId,
      envId: PROJECT_ENV_PROD,
      connectionId: 'c9_presto',
      type: 'Presto',
      options: {
        presto: {
          server: 'http://dwh-presto',
          port: 8082,
          catalog: undefined,
          schema: undefined,
          user: demoProjectDwhPrestoUser,
          password: cs.get<BackendConfig['demoProjectDwhPrestoPassword']>(
            'demoProjectDwhPrestoPassword'
          ),
          extraConfig: undefined
        }
      }
    });

    connections.push(c9);
  }

  await db.writeUnwrap({
    insert: {
      connections: connections
    }
  });

  return connections;
}
