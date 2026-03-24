import type { ConnectionConfigEntry } from '@malloydata/malloy';
import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, or } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { BigQueryService } from '#backend/services/dwh/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql.service';
import { PgService } from '#backend/services/dwh/pg.service';
import { PrestoService } from '#backend/services/dwh/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino.service';
import { TabService } from '#backend/services/tab.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { MalloyConfigPart } from '#common/interfaces/backend/malloy-config-part';
import { EnvsService } from '../db/envs.service';

@Injectable()
export class EditorConnectionsService {
  constructor(
    private envsService: EnvsService,
    private tabService: TabService,
    private pgService: PgService,
    private mysqlService: MysqlService,
    private bigQueryService: BigQueryService,
    private snowFlakeService: SnowFlakeService,
    private duckDbService: DuckDbService,
    private databricksService: DatabricksService,
    private trinoService: TrinoService,
    private prestoService: PrestoService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getMalloySandboxEnvsAndFiles(item: {
    projectId: string;
    envId: string;
  }): Promise<{
    malloyConnectionEnvs: Record<string, string>;
    malloySandboxFiles: { path: string; data: string }[];
  }> {
    let { projectId, envId } = item;

    let malloyConnectionEnvs: Record<string, string> = {};
    let malloySandboxFiles: { path: string; data: string }[] = [];

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });
    let apiEnv = apiEnvs.find(x => x.envId === envId);

    let connections: ConnectionTab[] = [];
    let apiEnvIsDefined = isDefined(apiEnv);
    if (apiEnvIsDefined) {
      connections = await this.db.drizzle.query.connectionsTable
        .findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            or(
              eq(connectionsTable.envId, envId),
              and(
                eq(connectionsTable.envId, PROJECT_ENV_PROD),
                inArray(
                  connectionsTable.connectionId,
                  apiEnv.fallbackConnectionIds
                )
              )
            )
          )
        })
        .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));
    }

    let malloyConnectionConfigEntries: Record<string, ConnectionConfigEntry> =
      {};

    connections.forEach(connection => {
      let connectionIdUpperSnakeCase = connection.connectionId
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_');

      let prefix = `MPROVE_CONNECTION_${connectionIdUpperSnakeCase}`;

      malloyConnectionEnvs[`${prefix}_TYPE`] = connection.type;

      let config: MalloyConfigPart;

      switch (connection.type) {
        case ConnectionTypeEnum.PostgreSQL: {
          if (isDefined(connection.options.postgres)) {
            config = this.pgService.makeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case ConnectionTypeEnum.MySQL: {
          if (isDefined(connection.options.mysql)) {
            config = this.mysqlService.makeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case ConnectionTypeEnum.BigQuery: {
          if (isDefined(connection.options.bigquery)) {
            config = this.bigQueryService.makeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case ConnectionTypeEnum.SnowFlake: {
          if (isDefined(connection.options.snowflake)) {
            config = this.snowFlakeService.makeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case ConnectionTypeEnum.MotherDuck: {
          if (isDefined(connection.options.motherduck)) {
            config = this.duckDbService.makeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case ConnectionTypeEnum.Databricks: {
          if (isDefined(connection.options.databricks)) {
            config = this.databricksService.makeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case ConnectionTypeEnum.Trino: {
          if (isDefined(connection.options.trino)) {
            config = this.trinoService.makeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case ConnectionTypeEnum.Presto: {
          if (isDefined(connection.options.presto)) {
            config = this.prestoService.makeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
      }

      if (isDefined(config)) {
        Object.assign(malloyConnectionEnvs, config.envs);

        malloyConnectionConfigEntries[connection.connectionId] =
          config.malloyConnectionConfigEntry;

        malloySandboxFiles.push(...config.files);
      }
    });

    malloySandboxFiles.push({
      path: '/home/user/.config/malloy/malloy-config.json',
      data: JSON.stringify(
        { connections: malloyConnectionConfigEntries },
        null,
        2
      )
    });

    return {
      malloyConnectionEnvs: malloyConnectionEnvs,
      malloySandboxFiles: malloySandboxFiles
    };
  }
}
