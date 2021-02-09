import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppFilter } from './app-filter';
import { AppInterceptor } from './app-interceptor';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalStrategy } from './auth-strategies/local-strategy.strategy';
import { interfaces } from './barrels/interfaces';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
