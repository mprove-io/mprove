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
        let rabbitUser = cs.get<interfaces.Config['rabbitUser']>('rabbitUser');
        let rabbitPass = cs.get<interfaces.Config['rabbitPass']>('rabbitPass');
        let rabbitHost = cs.get<interfaces.Config['rabbitHost']>('rabbitHost');
        let rabbitPort = cs.get<interfaces.Config['rabbitPort']>('rabbitPort');
        let rabbitProtocol = cs.get<interfaces.Config['rabbitProtocol']>(
          'rabbitProtocol'
        );

        let diskEnv = cs.get<interfaces.Config['diskEnv']>('diskEnv');

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
            wait: diskEnv !== enums.DiskEnvEnum.PROD,
            timeout: diskEnv !== enums.DiskEnvEnum.PROD ? 75000 : undefined
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
