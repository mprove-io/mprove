import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appControllers } from './app-controllers';
import { api } from './barrels/api';
import { enums } from './barrels/enums';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { getConfig } from './config/get.config';
import { ConsumerMainService } from './services/consumer-main.service';
import { ConsumerWorkerService } from './services/consumer-worker.service';
import { DashboardService } from './services/dashboard.service';
import { GenSqlService } from './services/gen-sql.service';
import { QueryService } from './services/query.service';
import { RabbitService } from './services/rabbit.service';
import { StructService } from './services/struct.service';

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
  controllers: appControllers,
  providers: [
    RabbitService,
    GenSqlService,
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
      useFactory: (
        cs: ConfigService<interfaces.Config>,
        genSqlService: GenSqlService
      ) => {
        let blockmlIsWorker = cs.get<interfaces.Config['blockmlIsWorker']>(
          'blockmlIsWorker'
        );

        return blockmlIsWorker === api.BoolEnum.TRUE
          ? new ConsumerWorkerService(cs, genSqlService)
          : {};
      },
      inject: [ConfigService, GenSqlService]
    }
  ]
})
export class AppModule {}
