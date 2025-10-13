import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalStrategy } from './auth-strategies/local-strategy.strategy';
import { isScheduler } from './functions/is-scheduler';
import { BlockmlService } from './services/blockml.service';
import { BranchesService } from './services/db/branches.service';
import { BridgesService } from './services/db/bridges.service';
import { ChartsService } from './services/db/charts.service';
import { ConnectionsService } from './services/db/connections.service';
import { DashboardsService } from './services/db/dashboards.service';
import { DconfigsService } from './services/db/dconfigs.service';
import { EnvsService } from './services/db/envs.service';
import { MconfigsService } from './services/db/mconfigs.service';
import { MembersService } from './services/db/members.service';
import { ModelsService } from './services/db/models.service';
import { OrgsService } from './services/db/orgs.service';
import { ProjectsService } from './services/db/projects.service';
import { QueriesService } from './services/db/queries.service';
import { ReportsService } from './services/db/reports.service';
import { StructsService } from './services/db/structs.service';
import { UsersService } from './services/db/users.service';
import { DocService } from './services/doc.service';
import { BigQueryService } from './services/dwh/bigquery.service';
import { ClickHouseService } from './services/dwh/clickhouse.service';
import { DuckDbService } from './services/dwh/duckdb.service';
import { MysqlService } from './services/dwh/mysql.service';
import { PgService } from './services/dwh/pg.service';
import { PrestoService } from './services/dwh/presto.service';
import { SnowFlakeService } from './services/dwh/snowflake.service';
import { TrinoService } from './services/dwh/trino.service';
import { EmailService } from './services/email.service';
import { HashService } from './services/hash.service';
import { MalloyService } from './services/malloy.service';
import { RabbitService } from './services/rabbit.service';
import { RedisService } from './services/redis.service';
import { ReportDataService } from './services/report-data.service';
import { ReportRowService } from './services/report-row.service';
import { ReportTimeColumnsService } from './services/report-time-columns.service';
import { StoreService } from './services/store.service';
import { TabService } from './services/tab.service';
import { TasksService } from './services/tasks.service';
import { UserCodeService } from './services/user-code.service';

export const appProviders = [
  HashService,
  RedisService,
  RabbitService,
  EmailService,
  BlockmlService,
  UserCodeService,
  UsersService,
  OrgsService,
  ProjectsService,
  TabService,
  ConnectionsService,
  BranchesService,
  ModelsService,
  MconfigsService,
  MalloyService,
  PgService,
  MysqlService,
  TrinoService,
  PrestoService,
  DuckDbService,
  ClickHouseService,
  BigQueryService,
  SnowFlakeService,
  StoreService,
  StructsService,
  QueriesService,
  ChartsService,
  DashboardsService,
  DconfigsService,
  ReportsService,
  ReportDataService,
  ReportRowService,
  ReportTimeColumnsService,
  MembersService,
  EnvsService,
  DocService,
  BridgesService,
  {
    provide: TasksService,
    useFactory: (
      cs: ConfigService<BackendConfig>,
      queriesService: QueriesService,
      structsService: StructsService,
      logger: Logger
    ) =>
      isScheduler(cs)
        ? new TasksService(cs, queriesService, structsService, logger)
        : {},
    inject: [ConfigService, QueriesService, StructsService]
  },
  LocalStrategy,
  JwtStrategy
];
