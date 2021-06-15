import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';
import { common } from './barrels/common';
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
              name: common.RabbitExchangesEnum.Blockml.toString(),
              type: 'direct'
            },
            {
              name: common.RabbitExchangesEnum.BlockmlWorker.toString(),
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