import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { appControllers } from './app-controllers';
import { appEntities } from './app-entities';
import { appProviders } from './app-providers';
import { appRepositories } from './app-repositories';
import { api } from './barrels/api';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    }),

    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (cs: ConfigService<interfaces.Config>) => {
        let rabbitUser = cs.get<interfaces.Config['rabbitmqDefaultUser']>(
          'rabbitmqDefaultUser'
        );

        let rabbitPass = cs.get<interfaces.Config['rabbitmqDefaultPass']>(
          'rabbitmqDefaultPass'
        );

        let backendEnv = cs.get<interfaces.Config['backendEnv']>('backendEnv');

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
      useFactory: (cs: ConfigService<interfaces.Config>) => ({
        type: 'mysql',
        host: 'db',
        port: 3306,
        username: 'root',
        password: cs.get<interfaces.Config['mysqlRootPassword']>(
          'mysqlRootPassword'
        ),
        database: cs.get<interfaces.Config['mysqlDatabase']>('mysqlDatabase'),
        entities: appEntities,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}']
      }),
      inject: [ConfigService]
    }),

    TypeOrmModule.forFeature([...appRepositories])
  ],
  controllers: appControllers,
  providers: appProviders
})
export class AppModule implements OnModuleInit {
  constructor(
    private connection: Connection,
    private usersService: UsersService,
    private cs: ConfigService<interfaces.Config>
  ) {}

  async onModuleInit() {
    try {
      if (
        this.cs.get<interfaces.Config['backendDropDatabaseOnStart']>(
          'backendDropDatabaseOnStart'
        ) === api.BoolEnum.TRUE
      ) {
        await this.connection.dropDatabase();
      }

      if (
        this.cs.get<interfaces.Config['backendSyncDatabaseOnStart']>(
          'backendSyncDatabaseOnStart'
        ) === api.BoolEnum.TRUE
      ) {
        await this.connection.synchronize();
      } else {
        await this.connection.runMigrations();
      }

      let userId = this.cs.get<interfaces.Config['backendFirstUserEmail']>(
        'backendFirstUserEmail'
      );

      let password = this.cs.get<interfaces.Config['backendFirstUserPassword']>(
        'backendFirstUserPassword'
      );

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
