import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppFilter } from './app-filter';
import { AppInterceptor } from './app-interceptor';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalStrategy } from './auth-strategies/local-strategy.strategy';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { repositories } from './barrels/repositories';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BigQueryService } from './services/bigquery.service';
import { BlockmlService } from './services/blockml.service';
import { BranchesService } from './services/branches.service';
import { ConnectionsService } from './services/connections.service';
import { DashboardsService } from './services/dashboards.service';
import { DbService } from './services/db.service';
import { MconfigsService } from './services/mconfigs.service';
import { MembersService } from './services/members.service';
import { ModelsService } from './services/models.service';
import { OrgsService } from './services/orgs.service';
import { PgService } from './services/pg.service';
import { ProjectsService } from './services/projects.service';
import { QueriesService } from './services/queries.service';
import { RabbitService } from './services/rabbit.service';
import { RunService } from './services/run.service';
import { StructsService } from './services/structs.service';
import { TasksService } from './services/tasks.service';
import { UsersService } from './services/users.service';
import { VizsService } from './services/vizs.service';

export const appProviders = [
  RabbitService,
  DbService,
  BlockmlService,
  UsersService,
  OrgsService,
  ProjectsService,
  ConnectionsService,
  BranchesService,
  ModelsService,
  MconfigsService,
  PgService,
  BigQueryService,
  RunService,
  StructsService,
  QueriesService,
  VizsService,
  DashboardsService,
  MembersService,
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
  JwtStrategy,
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  },
  {
    provide: APP_FILTER,
    useClass: AppFilter
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: AppInterceptor
  }
];
