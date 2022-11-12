import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
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

    LoggerModule.forRoot({
      pinoHttp: {
        // level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.DISK_LOG_IS_STRINGIFY === common.BoolEnum.FALSE
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  ignore: 'context,pid,hostname',
                  levelFirst: false,
                  translateTime: 'UTC:yyyy-mm-dd HH:MM:ss',
                  messageFormat:
                    '   \x1B[33m[{context}]\x1b[0m' + ' \x1B[32m{msg}\x1B[39m'
                }
              }
            : undefined
      }
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
  providers: appServices
})
// implements OnModuleInit
export class AppModule {
  //   constructor(private pinoLogger: PinoLogger) {}
  //   async onModuleInit() {
  //     console.log(123);
  //     this.pinoLogger.info(12345);
  //     this.pinoLogger.error(555);
  //     this.pinoLogger.error(['a', 'b']);
  //     this.pinoLogger.info(['c', 'd']);
  //     this.pinoLogger.error(new ServerError({ message: '555' }));
  //   }
}
