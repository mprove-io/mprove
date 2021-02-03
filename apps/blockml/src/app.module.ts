import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';
import { api } from './barrels/api';
import { enums } from './barrels/enums';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';

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

        let blockmlEnv = cs.get<interfaces.Config['blockmlEnv']>('blockmlEnv');

        return {
          exchanges: [
            {
              name: api.RabbitExchangesEnum.Blockml.toString(),
              type: 'direct'
            },
            {
              name: api.RabbitExchangesEnum.BlockmlWorker.toString(),
              type: 'direct'
            }
          ],
          uri: [`amqp://${rabbitUser}:${rabbitPass}@rabbit:5672`],
          connectionInitOptions: {
            // wait for connection on startup, but do not recover when connection lost
            wait: blockmlEnv !== enums.BlockmlEnvEnum.PROD,
            timeout:
              blockmlEnv !== enums.BlockmlEnvEnum.PROD ? 75000 : undefined
          }
        };
      },
      inject: [ConfigService]
    })
  ],
  controllers: appControllers,
  providers: appServices
})
export class AppModule {}
