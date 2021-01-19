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
      isGlobal: true,
      validate: config => {
        api.transformValidSync({
          classType: interfaces.Config,
          object: getConfig(),
          errorMessage: api.ErEnum.M_DISK_WRONG_ENV_VALUES
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
