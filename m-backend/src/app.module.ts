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
import { enums } from './barrels/enums';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    }),

    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService<interfaces.Config>) => {
        let rabbitUser = configService.get<
          interfaces.Config['rabbitmqDefaultUser']
        >('rabbitmqDefaultUser');

        let rabbitPass = configService.get<
          interfaces.Config['rabbitmqDefaultPass']
        >('rabbitmqDefaultPass');

        let backendEnv = configService.get<interfaces.Config['backendEnv']>(
          'backendEnv'
        );

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
          connectionInitOptions: {
            // wait for connection on startup, but do not recover when connection lost
            wait: backendEnv !== enums.BackendEnvEnum.PROD,
            timeout:
              backendEnv !== enums.BackendEnvEnum.PROD ? 75000 : undefined
          }
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
        password: configService.get<interfaces.Config['mysqlRootPassword']>(
          'mysqlRootPassword'
        ),
        database: configService.get<interfaces.Config['mysqlDatabase']>(
          'mysqlDatabase'
        ),
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
        this.configService.get<interfaces.Config['backendDropDatabaseOnStart']>(
          'backendDropDatabaseOnStart'
        ) === api.BoolEnum.TRUE
      ) {
        await this.connection.dropDatabase();
      }

      if (
        this.configService.get<interfaces.Config['backendSyncDatabaseOnStart']>(
          'backendSyncDatabaseOnStart'
        ) === api.BoolEnum.TRUE
      ) {
        await this.connection.synchronize();
      } else {
        await this.connection.runMigrations();
      }

      let userId = this.configService.get<
        interfaces.Config['backendFirstUserEmail']
      >('backendFirstUserEmail');

      let password = this.configService.get<
        interfaces.Config['backendFirstUserPassword']
      >('backendFirstUserPassword');

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
