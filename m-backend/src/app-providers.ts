import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppFilter } from './app-filter';
import { interfaces } from './barrels/interfaces';
import { LocalStrategyService } from './services/local-strategy.service';
import { RabbitService } from './services/rabbit.service';
import { UsersService } from './services/users.service';

export const appProviders = [
  RabbitService,
  UsersService,
  {
    provide: APP_FILTER,
    useFactory: async (configService: ConfigService<interfaces.Config>) =>
      new AppFilter(configService),
    inject: [ConfigService]
  },
  LocalStrategyService
];
