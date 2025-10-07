import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalStrategy } from './auth-strategies/local-strategy.strategy';
import { isScheduler } from './functions/is-scheduler';
import { BigQueryService } from './services/bigquery.service';
import { BlockmlService } from './services/blockml.service';
import { BranchesService } from './services/branches.service';
import { BridgesService } from './services/bridges.service';
import { ChartsService } from './services/charts.service';
import { ClickHouseService } from './services/clickhouse.service';
import { ConnectionsService } from './services/connections.service';
import { DashboardsService } from './services/dashboards.service';
import { DocService } from './services/doc.service';
import { DuckDbService } from './services/duckdb.service';
import { EmailService } from './services/email.service';
import { EnvsService } from './services/envs.service';
import { HashService } from './services/hash.service';
import { EntMakerService } from './services/maker.service';
import { MalloyService } from './services/malloy.service';
import { MconfigsService } from './services/mconfigs.service';
import { MembersService } from './services/members.service';
import { ModelsService } from './services/models.service';
import { MysqlService } from './services/mysql.service';
import { OrgsService } from './services/orgs.service';
import { PgService } from './services/pg.service';
import { PrestoService } from './services/presto.service';
import { ProjectsService } from './services/projects.service';
import { QueriesService } from './services/queries.service';
import { RabbitService } from './services/rabbit.service';
import { RedisService } from './services/redis.service';
import { ReportDataService } from './services/report-data.service';
import { ReportRowService } from './services/report-row.service';
import { ReportTimeColumnsService } from './services/report-time-columns.service';
import { ReportsService } from './services/reports.service';
import { SnowFlakeService } from './services/snowflake.service';
import { StoreService } from './services/store.service';
import { StructsService } from './services/structs.service';
import { TabService } from './services/tab.service';
import { TasksService } from './services/tasks.service';
import { TrinoService } from './services/trino.service';
import { UserCodeService } from './services/user-code.service';
import { UsersService } from './services/users.service';
import { WrapEnxToApiService } from './services/wrap-to-api.service';
import { WrapToEntService } from './services/wrap-to-ent.service';

export const appProviders = [
  WrapToEntService,
  WrapEnxToApiService,
  EntMakerService,
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
