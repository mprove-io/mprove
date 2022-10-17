import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';
import { common } from './barrels/common';
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
        let rabbitUser = cs.get<interfaces.Config['diskRabbitUser']>(
          'diskRabbitUser'
        );
        let rabbitPass = cs.get<interfaces.Config['diskRabbitPass']>(
          'diskRabbitPass'
        );
        let rabbitHost = cs.get<interfaces.Config['diskRabbitHost']>(
          'diskRabbitHost'
        );
        let rabbitPort = cs.get<interfaces.Config['diskRabbitPort']>(
          'diskRabbitPort'
        );
        let rabbitProtocol = cs.get<interfaces.Config['diskRabbitProtocol']>(
          'diskRabbitProtocol'
        );

        return {
          exchanges: [
            {
              name: common.RabbitExchangesEnum.Disk.toString(),
              type: 'direct'
            }
          ],
          uri: [
            `${rabbitProtocol}://${rabbitUser}:${rabbitPass}@${rabbitHost}:${rabbitPort}`
          ],
          connectionInitOptions: {
            // wait for connection on startup, but do not recover when connection lost
            wait: false,
            timeout: undefined
          },
          connectionManagerOptions: {
            connectionOptions: { rejectUnauthorized: false }
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
