import { api } from './barrels/api';
import { appControllers } from './app-controllers';
import { helper } from './barrels/helper';
import { UsersService } from './services/users.service';

import { Module, OnModuleInit } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { appServices } from './app-services';
import { appEntities } from './app-entities';
import { appRepositories } from './app-repositories';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true,
      validate: config => {
        api.transformValidSync({
          classType: interfaces.Config,
          object: getConfig(),
          errorMessage: api.ErEnum.M_BACKEND_WRONG_ENV_VALUES
        });
        return config;
      }
    }),

    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService<interfaces.Config>) => {
        let rabbitUser = configService.get('rabbitmqDefaultUser');
        let rabbitPass = configService.get('rabbitmqDefaultPass');

        return {
          exchanges: [
            {
              name: api.RabbitExchangesEnum.MBlockml.toString(),
              type: 'direct'
            },
            {
              name: api.RabbitExchangesEnum.MDisk.toString(),
              type: 'direct'
            }
          ],
          uri: [`amqp://${rabbitUser}:${rabbitPass}@rabbit:5672`],
          connectionInitOptions: { wait: false }
        };
      },
      inject: [ConfigService]
    }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<interfaces.Config>) => ({
        type: 'mysql',
        host: 'db',
        port: 3306,
        username: 'root',
        password: configService.get('mysqlRootPassword'),
        database: configService.get('mysqlDatabase'),
        entities: appEntities,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}']
      }),
      inject: [ConfigService]
    }),

    TypeOrmModule.forFeature([...appRepositories])
  ],
  controllers: appControllers,
  providers: appServices
})
export class AppModule implements OnModuleInit {
  constructor(
    private connection: Connection,
    private usersService: UsersService,
    private configService: ConfigService<interfaces.Config>
  ) {}

  async onModuleInit() {
    try {
      if (
        this.configService.get('backendDropDatabaseOnStart') ===
        api.BoolEnum.TRUE
      ) {
        await this.connection.dropDatabase();
      }

      if (
        this.configService.get('backendSyncDatabaseOnStart') ===
        api.BoolEnum.TRUE
      ) {
        await this.connection.synchronize();
      } else {
        await this.connection.runMigrations();
      }

      let userId = this.configService.get('backendFirstUserEmail');
      let password = this.configService.get('backendFirstUserPassword');

      if (helper.isDefined(userId) && helper.isDefined(password)) {
        let firstUser = await this.usersService.findOneById(userId);

        if (helper.isUndefined(firstUser)) {
          await this.usersService.addFirstUser({
            userId: userId,
            password: password
          });
        }
      }
    } catch (e) {
      api.handleError(e);
      process.exit(1);
    }
  }
}
