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
import devConfig from './config/dev.config';
import prodConfig from './config/prod.config';
import testConfig from './config/test.config';
import { interfaces } from './barrels/interfaces';

let envConfig = process.env.BACKEND_ENV_CONFIG;

let configFile =
  envConfig === 'TEST'
    ? testConfig
    : envConfig === 'PROD'
    ? prodConfig
    : envConfig === 'DEV'
    ? devConfig
    : devConfig;

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configFile],
      isGlobal: true
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
        migrations: [__dirname + '/migration/*.js']
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
      let drop = this.configService.get('backendDropDatabaseOnStart');

      if (drop === api.BoolEnum.TRUE) {
        await this.connection.dropDatabase();
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
