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

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
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
      uri: [
        `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbit:5672`
      ],
      connectionInitOptions: { wait: false }
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'root',
      password: process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: appEntities,
      migrations: [__dirname + '/migration/*.js']
    }),
    TypeOrmModule.forFeature([...appRepositories])
  ],
  controllers: appControllers,
  providers: appServices
})
export class AppModule implements OnModuleInit {
  constructor(
    private connection: Connection,
    private usersService: UsersService
  ) {}

  async onModuleInit() {
    try {
      if (process.env.BACKEND_DROP_DATABASE_ON_START === 'TRUE') {
        await this.connection.dropDatabase();
        await this.connection.synchronize();
      } else {
        await this.connection.runMigrations();
      }

      let userId = process.env.BACKEND_FIRST_USER_EMAIL;
      let password = process.env.BACKEND_FIRST_USER_PASSWORD;

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
