import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import { appControllers } from './app-controllers';
import { appServices } from './app-services';
import { common } from './barrels/common';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';
import { logToConsoleBlockml } from './functions/log-to-console-blockml';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
      isGlobal: true
    }),

    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.BLOCKML_LOG_IS_STRINGIFY === common.BoolEnum.FALSE
            ? common.LOGGER_MODULE_TRANSPORT
            : undefined
      }
    }),

    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (cs: ConfigService<interfaces.Config>) => {
        let rabbitUser =
          cs.get<interfaces.Config['blockmlRabbitUser']>('blockmlRabbitUser');
        let rabbitPass =
          cs.get<interfaces.Config['blockmlRabbitPass']>('blockmlRabbitPass');
        let rabbitPort =
          cs.get<interfaces.Config['blockmlRabbitPort']>('blockmlRabbitPort');
        let rabbitHost =
          cs.get<interfaces.Config['blockmlRabbitHost']>('blockmlRabbitHost');
        let rabbitProtocol = cs.get<interfaces.Config['blockmlRabbitProtocol']>(
          'blockmlRabbitProtocol'
        );

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
export class AppModule implements OnModuleInit {
  constructor(private pinoLogger: PinoLogger) {}

  async onModuleInit() {
    logToConsoleBlockml({
      log: `NODE_ENV is set to "${process.env.NODE_ENV}"`,
      logLevel: common.LogLevelEnum.Info,
      pinoLogger: this.pinoLogger
    });
  }
}
