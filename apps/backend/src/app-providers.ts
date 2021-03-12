import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppFilter } from './app-filter';
import { AppInterceptor } from './app-interceptor';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalStrategy } from './auth-strategies/local-strategy.strategy';
import { interfaces } from './barrels/interfaces';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BlockmlService } from './services/blockml.service';
import { BranchesService } from './services/branches.service';
import { ConnectionsService } from './services/connections.service';
import { DashboardsService } from './services/dashboards.service';
import { MconfigsService } from './services/mconfigs.service';
import { MembersService } from './services/members.service';
import { ModelsService } from './services/models.service';
import { OrgsService } from './services/orgs.service';
import { ProjectsService } from './services/projects.service';
import { QueriesService } from './services/queries.service';
import { RabbitService } from './services/rabbit.service';
import { ReposService } from './services/repos.service';
import { StructsService } from './services/structs.service';
import { UsersService } from './services/users.service';
import { VizsService } from './services/vizs.service';

export const appProviders = [
  RabbitService,
  BlockmlService,
  UsersService,
  OrgsService,
  ProjectsService,
  ConnectionsService,
  ReposService,
  BranchesService,
  ModelsService,
  MconfigsService,
  StructsService,
  QueriesService,
  VizsService,
  DashboardsService,
  MembersService,
  {
    provide: APP_FILTER,
    useFactory: async (configService: ConfigService<interfaces.Config>) =>
      new AppFilter(configService),
    inject: [ConfigService]
  },
  LocalStrategy,
  JwtStrategy,
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: AppInterceptor,
    inject: [ConfigService]
  }
];
