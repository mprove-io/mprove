import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalStrategy } from './auth-strategies/local-strategy.strategy';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';
import { BigQueryService } from './services/bigquery.service';
import { BlockmlService } from './services/blockml.service';
import { BranchesService } from './services/branches.service';
import { BridgesService } from './services/bridges.service';
import { ClickHouseService } from './services/clickhouse.service';
import { ConnectionsService } from './services/connections.service';
import { DashboardsService } from './services/dashboards.service';
import { DbService } from './services/db.service';
import { EmailService } from './services/email.service';
import { EnvsService } from './services/envs.service';
import { EvsService } from './services/evs.service';
import { MconfigsService } from './services/mconfigs.service';
import { MembersService } from './services/members.service';
import { ModelsService } from './services/models.service';
import { OrgsService } from './services/orgs.service';
import { PgService } from './services/pg.service';
import { ProjectsService } from './services/projects.service';
import { QueriesService } from './services/queries.service';
import { RabbitService } from './services/rabbit.service';
import { RunService } from './services/run.service';
import { SnowFlakeService } from './services/snowflake.service';
import { StructsService } from './services/structs.service';
import { TasksService } from './services/tasks.service';
import { UsersService } from './services/users.service';
import { VizsService } from './services/vizs.service';

export const appProviders = [
  RabbitService,
  DbService,
  EmailService,
  BlockmlService,
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
  RunService,
  StructsService,
  QueriesService,
  VizsService,
  DashboardsService,
  MembersService,
  EnvsService,
  EvsService,
  BridgesService,
  {
    provide: TasksService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      queriesService: QueriesService,
      structsService: StructsService,
      idempsRepository: repositories.IdempsRepository
    ) =>
      helper.isScheduler(cs)
        ? new TasksService(cs, queriesService, structsService, idempsRepository)
        : {},
    inject: [
      ConfigService,
      QueriesService,
      StructsService,
      repositories.IdempsRepository
    ]
  },
  LocalStrategy,
  JwtStrategy
];
