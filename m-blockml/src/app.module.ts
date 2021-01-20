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
      provide: StructService,
      useFactory: (
        configService: ConfigService,
        rabbitService: RabbitService
      ) =>
        helper.isSingleOrMain(configService)
          ? new StructService(rabbitService, configService)
          : {},
      inject: [ConfigService, RabbitService]
    },
    {
      provide: QueryService,
      useFactory: (
        configService: ConfigService,
        rabbitService: RabbitService
      ) =>
        helper.isSingleOrMain(configService)
          ? new QueryService(rabbitService, configService)
          : {},
      inject: [ConfigService, RabbitService]
    },
    {
      provide: DashboardService,
      useFactory: (
        configService: ConfigService,
        rabbitService: RabbitService
      ) =>
        helper.isSingleOrMain(configService)
          ? new DashboardService(rabbitService, configService)
          : {},
      inject: [ConfigService, RabbitService]
    },
    {
      provide: ConsumerMainService,
      useFactory: (
        configService: ConfigService,
        structService: StructService,
        queryService: QueryService,
        dashboardService: DashboardService
      ) => {
        let result = helper.isSingleOrMain(configService)
          ? new ConsumerMainService(
              structService,
              queryService,
              dashboardService
            )
          : {};
        return result;
      },
      inject: [ConfigService, StructService, QueryService, DashboardService]
    },
    {
      provide: ConsumerWorkerService,
      useFactory: (configService: ConfigService<interfaces.Config>) => {
        let blockmlIsWorker = configService.get<
          interfaces.Config['blockmlIsWorker']
        >('blockmlIsWorker');

        return blockmlIsWorker === api.BoolEnum.TRUE
          ? new ConsumerWorkerService()
          : {};
      },
      inject: [ConfigService]
    }
  ]
})
export class AppModule {}
