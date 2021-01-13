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
import { UserEntity } from './store-entities/_index';

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
    TypeOrmModule.forFeature([...appEntities])
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
    if (process.env.BACKEND_DROP_DATABASE_ON_START === 'TRUE') {
      await this.connection.dropDatabase();
      await this.connection.synchronize();
    } else {
      await this.connection.runMigrations();
    }

    let firstUserId = process.env.BACKEND_FIRST_USER_EMAIL;
    let firstUserPassword = process.env.BACKEND_FIRST_USER_PASSWORD;

    if (helper.isDefined(firstUserId) && helper.isDefined(firstUserPassword)) {
      let firstUser = await this.usersService.findOneById({ id: firstUserId });

      if (helper.isUndefined(firstUser)) {
        await this.usersService.addFirstUser({
          userId: firstUserId,
          password: firstUserPassword
        });
      }
    }
  }
}
