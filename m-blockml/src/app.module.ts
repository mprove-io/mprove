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
import { enums } from './barrels/enums';

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
              name: api.RabbitExchangesEnum.MBlockml.toString(),
              type: 'direct'
            },
            {
              name: api.RabbitExchangesEnum.MBlockmlWorker.toString(),
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
  controllers: [],
  providers: [
    RabbitService,
    {
      provide: StructService,
      useFactory: (cs: ConfigService, rabbitService: RabbitService) =>
        helper.isSingleOrMain(cs) ? new StructService(rabbitService, cs) : {},
      inject: [ConfigService, RabbitService]
    },
    {
      provide: QueryService,
      useFactory: (cs: ConfigService, rabbitService: RabbitService) =>
        helper.isSingleOrMain(cs) ? new QueryService(rabbitService, cs) : {},
      inject: [ConfigService, RabbitService]
    },
    {
      provide: DashboardService,
      useFactory: (cs: ConfigService, rabbitService: RabbitService) =>
        helper.isSingleOrMain(cs)
          ? new DashboardService(rabbitService, cs)
          : {},
      inject: [ConfigService, RabbitService]
    },
    {
      provide: ConsumerMainService,
      useFactory: (
        cs: ConfigService,
        structService: StructService,
        queryService: QueryService,
        dashboardService: DashboardService
      ) => {
        let result = helper.isSingleOrMain(cs)
          ? new ConsumerMainService(
              cs,
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
      useFactory: (cs: ConfigService<interfaces.Config>) => {
        let blockmlIsWorker = cs.get<interfaces.Config['blockmlIsWorker']>(
          'blockmlIsWorker'
        );

        return blockmlIsWorker === api.BoolEnum.TRUE
          ? new ConsumerWorkerService(cs)
          : {};
      },
      inject: [ConfigService]
    }
  ]
})
export class AppModule {}
