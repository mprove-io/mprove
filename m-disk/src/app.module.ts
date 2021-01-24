import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { api } from './barrels/api';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';
import { enums } from './barrels/enums';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';

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

        let diskEnv = cs.get<interfaces.Config['diskEnv']>('diskEnv');

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
  controllers: appControllers,
  providers: appServices
})
export class AppModule {}
