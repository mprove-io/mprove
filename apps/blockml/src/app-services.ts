import { ConfigService } from '@nestjs/config';
import { api } from './barrels/api';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { GenSqlService } from './controllers/gen-sql/gen-sql.service';
import { ProcessDashboardService } from './controllers/process-dashboard/process-dashboard.service';
import { ProcessQueryService } from './controllers/process-query/process-query.service';
import { RebuildStructService } from './controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerMainService } from './services/consumer-main.service';
import { ConsumerWorkerService } from './services/consumer-worker.service';
import { RabbitService } from './services/rabbit.service';

export const appServices = [
  RabbitService,
  GenSqlService,
  {
    provide: RebuildStructService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      rabbitService: RabbitService
    ) =>
      helper.isSingleOrMain(cs)
        ? new RebuildStructService(rabbitService, cs)
        : {},
    inject: [ConfigService, RabbitService]
  },
  {
    provide: ProcessQueryService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      rabbitService: RabbitService
    ) =>
      helper.isSingleOrMain(cs)
        ? new ProcessQueryService(rabbitService, cs)
        : {},
    inject: [ConfigService, RabbitService]
  },
  {
    provide: ProcessDashboardService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      rabbitService: RabbitService
    ) =>
      helper.isSingleOrMain(cs)
        ? new ProcessDashboardService(rabbitService, cs)
        : {},
    inject: [ConfigService, RabbitService]
  },
  {
    provide: ConsumerMainService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      structService: RebuildStructService,
      queryService: ProcessQueryService,
      dashboardService: ProcessDashboardService
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
    inject: [
      ConfigService,
      RebuildStructService,
      ProcessQueryService,
      ProcessDashboardService
    ]
  },
  {
    provide: ConsumerWorkerService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      genSqlService: GenSqlService
    ) => {
      let isWorker = cs.get<interfaces.Config['isWorker']>('isWorker');

      return isWorker === api.BoolEnum.TRUE
        ? new ConsumerWorkerService(cs, genSqlService)
        : {};
    },
    inject: [ConfigService, GenSqlService]
  }
];
