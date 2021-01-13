import { api } from './barrels/api';
import { RabbitService } from './services/rabbit.service';
import { UserEntity } from './store-entities/user.entity';
import { appControllers } from './app-controllers';

import { Module, OnModuleInit } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

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
      entities: [UserEntity],
      migrations: [__dirname + '/migration/*.js']
    })
  ],
  controllers: appControllers,
  providers: [RabbitService]
})
export class AppModule implements OnModuleInit {
  constructor(private connection: Connection) {}

  async onModuleInit() {
    if (process.env.BACKEND_DROP_DATABASE_ON_START === 'TRUE') {
      await this.connection.dropDatabase();
      await this.connection.synchronize();
    } else {
      await this.connection.runMigrations();
    }
  }
}
