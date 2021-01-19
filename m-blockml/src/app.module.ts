import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConsumerMainService } from './services/consumer-main.service';
import { api } from './barrels/api';
import { StructService } from './services/struct.service';
import { QueryService } from './services/query.service';
import { DashboardService } from './services/dashboard.service';
import { ConsumerWorkerService } from './services/consumer-worker.service';
import { RabbitService } from './services/rabbit.service';
import { getConfig } from './config/get.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { interfaces } from './barrels/interfaces';
import { helper } from './barrels/helper';

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

        return {
          exchanges: [
            {
              name: api.RabbitExchangesEnum.MBlockml.toString(),
              type: 'direct'
            },
            {
              name: api.RabbitExchangesEnum.MBlockmlWorker.toString(),
              type: 'direct'
            }
          ],
          uri: [`amqp://${rabbitUser}:${rabbitPass}@rabbit:5672`],
          connectionInitOptions: { wait: false }
        };
      },
      inject: [ConfigService]
    })
  ],
  controllers: [],
  providers: [
    RabbitService,
    {
      provide: ConsumerMainService,
      useFactory: (configService: ConfigService) =>
        helper.isSingleOrMain(configService) ? ConsumerMainService : {},
      inject: [ConfigService]
    },
    {
      provide: DashboardService,
      useFactory: (configService: ConfigService) =>
        helper.isSingleOrMain(configService) ? DashboardService : {},
      inject: [ConfigService]
    },
    {
      provide: QueryService,
      useFactory: (configService: ConfigService) =>
        helper.isSingleOrMain(configService) ? QueryService : {},
      inject: [ConfigService]
    },
    {
      provide: StructService,
      useFactory: (configService: ConfigService) =>
        helper.isSingleOrMain(configService) ? StructService : {},
      inject: [ConfigService]
    },
    {
      provide: ConsumerWorkerService,
      useFactory: (configService: ConfigService<interfaces.Config>) => {
        let blockmlIsWorker = configService.get<
          interfaces.Config['blockmlIsWorker']
        >('blockmlIsWorker');

        return blockmlIsWorker === api.BoolEnum.TRUE
          ? ConsumerWorkerService
          : {};
      },
      inject: [ConfigService]
    }
  ]
})
export class AppModule {}
