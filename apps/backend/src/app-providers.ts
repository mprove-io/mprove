import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalStrategy } from './auth-strategies/local-strategy.strategy';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { BigQueryService } from './services/bigquery.service';
import { BlockmlService } from './services/blockml.service';
import { BranchesService } from './services/branches.service';
import { BridgesService } from './services/bridges.service';
import { ClickHouseService } from './services/clickhouse.service';
import { ConnectionsService } from './services/connections.service';
import { DashboardsService } from './services/dashboards.service';
import { DbService } from './services/db.service';
import { DocService } from './services/doc.service';
import { EmailService } from './services/email.service';
import { EnvsService } from './services/envs.service';
import { EvsService } from './services/evs.service';
import { HashService } from './services/hash.service';
import { MconfigsService } from './services/mconfigs.service';
import { MembersService } from './services/members.service';
import { ModelsService } from './services/models.service';
import { OrgsService } from './services/orgs.service';
import { PgService } from './services/pg.service';
import { ProjectsService } from './services/projects.service';
import { QueriesService } from './services/queries.service';
import { RabbitService } from './services/rabbit.service';
import { RedisService } from './services/redis.service';
import { ReportsService } from './services/reports.service';
import { SnowFlakeService } from './services/snowflake.service';
import { StructsService } from './services/structs.service';
import { TasksService } from './services/tasks.service';
import { UserCodeService } from './services/user-code.service';
import { UsersService } from './services/users.service';
import { VizsService } from './services/vizs.service';
import { WrapToApiService } from './services/wrap-to-api.service';
import { WrapToEntService } from './services/wrap-to-ent.service';

export const appProviders = [
  WrapToEntService,
  WrapToApiService,
  HashService,
  RedisService,
  RabbitService,
  DbService,
  EmailService,
  BlockmlService,
  UserCodeService,
  UsersService,
  OrgsService,
  ProjectsService,
  ConnectionsService,
  BranchesService,
  ModelsService,
  MconfigsService,
  PgService,
  ClickHouseService,
  BigQueryService,
  SnowFlakeService,
  StructsService,
  QueriesService,
  VizsService,
  DashboardsService,
  ReportsService,
  MembersService,
  EnvsService,
  EvsService,
  DocService,
  BridgesService,
  {
    provide: TasksService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      queriesService: QueriesService,
      structsService: StructsService,
      logger: Logger
    ) =>
      helper.isScheduler(cs)
        ? new TasksService(cs, queriesService, structsService, logger)
        : {},
    inject: [ConfigService, QueriesService, StructsService]
  },
  LocalStrategy,
  JwtStrategy
];
