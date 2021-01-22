import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConsumerService } from './services/consumer.service';
import { MessageService } from './services/message.service';
import { api } from './barrels/api';
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

        let diskEnv = configService.get<interfaces.Config['diskEnv']>(
          'diskEnv'
        );

        return {
          exchanges: [
            {
              name: api.RabbitExchangesEnum.MDisk.toString(),
              type: 'direct'
            }
          ],
          uri: [`amqp://${rabbitUser}:${rabbitPass}@rabbit:5672`],
          connectionInitOptions: {
            // wait for connection on startup, but do not recover when connection lost
            wait: diskEnv !== enums.DiskEnvEnum.PROD,
            timeout: diskEnv !== enums.DiskEnvEnum.PROD ? 75000 : undefined
          }
        };
      },
      inject: [ConfigService]
    })
  ],
  controllers: [],
  providers: [ConsumerService, MessageService]
})
export class AppModule {}
