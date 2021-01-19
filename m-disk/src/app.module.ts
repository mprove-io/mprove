import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConsumerService } from './services/consumer.service';
import { MessageService } from './services/message.service';
import { api } from './barrels/api';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';

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

        return {
          exchanges: [
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
    })
  ],
  controllers: [],
  providers: [ConsumerService, MessageService]
})
export class AppModule {}
