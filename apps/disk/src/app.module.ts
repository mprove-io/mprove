import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { RabbitExchangesEnum } from '~common/enums/rabbit-exchanges.enum';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';
import { getConfig } from './config/get.config';
import { logToConsoleDisk } from './functions/log-to-console-disk';
import { Config } from './interfaces/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    }),

    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (cs: ConfigService<Config>) => {
        let rabbitUser = cs.get<Config['diskRabbitUser']>('diskRabbitUser');
        let rabbitPass = cs.get<Config['diskRabbitPass']>('diskRabbitPass');
        let rabbitHost = cs.get<Config['diskRabbitHost']>('diskRabbitHost');
        let rabbitPort = cs.get<Config['diskRabbitPort']>('diskRabbitPort');
        let rabbitProtocol =
          cs.get<Config['diskRabbitProtocol']>('diskRabbitProtocol');

        return {
          exchanges: [
            {
              name: RabbitExchangesEnum.Disk.toString(),
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
  constructor(
    private logger: Logger,
    private cs: ConfigService
  ) {}

  async onModuleInit() {
    logToConsoleDisk({
      log: `NODE_ENV is set to "${process.env.NODE_ENV}"`,
      logLevel: LogLevelEnum.Info,
      logger: this.logger,
      cs: this.cs
    });
  }
}
