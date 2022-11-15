import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';
import { common } from './barrels/common';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';
import { logToConsoleDisk } from './functions/log-to-console-disk';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    }),

    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (cs: ConfigService<interfaces.Config>) => {
        let rabbitUser =
          cs.get<interfaces.Config['diskRabbitUser']>('diskRabbitUser');
        let rabbitPass =
          cs.get<interfaces.Config['diskRabbitPass']>('diskRabbitPass');
        let rabbitHost =
          cs.get<interfaces.Config['diskRabbitHost']>('diskRabbitHost');
        let rabbitPort =
          cs.get<interfaces.Config['diskRabbitPort']>('diskRabbitPort');
        let rabbitProtocol =
          cs.get<interfaces.Config['diskRabbitProtocol']>('diskRabbitProtocol');

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
  providers: [Logger, ...appServices]
})
export class AppModule implements OnModuleInit {
  constructor(private logger: Logger, private cs: ConfigService) {}

  async onModuleInit() {
    logToConsoleDisk({
      log: `NODE_ENV is set to "${process.env.NODE_ENV}"`,
      logLevel: common.LogLevelEnum.Info,
      logger: this.logger,
      cs: this.cs
    });
  }
}
