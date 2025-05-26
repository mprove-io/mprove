import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from './barrels/common';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { GenSqlService } from './controllers/gen-sql/gen-sql.service';
import { GetFractionsService } from './controllers/get-fractions/get-fractions.service';
import { GetTimeRangeService } from './controllers/get-time-range/get-time-range.service';
import { ProcessQueryService } from './controllers/process-query/process-query.service';
import { RebuildStructService } from './controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerMainService } from './services/consumer-main.service';
import { ConsumerWorkerService } from './services/consumer-worker.service';
import { PresetsService } from './services/presets.service';
import { RabbitService } from './services/rabbit.service';

export const appServices = [
  PresetsService,
  RabbitService,
  GenSqlService,
  {
    provide: RebuildStructService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      rabbitService: RabbitService,
      presetsService: PresetsService,
      logger: Logger
    ) =>
      helper.isSingleOrMain(cs)
        ? new RebuildStructService(rabbitService, presetsService, cs, logger)
        : {},
    inject: [ConfigService, RabbitService, PresetsService]
  },
  {
    provide: ProcessQueryService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      rabbitService: RabbitService,
      logger: Logger
    ) =>
      helper.isSingleOrMain(cs)
        ? new ProcessQueryService(rabbitService, cs, logger)
        : {},
    inject: [ConfigService, RabbitService]
  },
  {
    provide: GetTimeRangeService,
    useFactory: (cs: ConfigService<interfaces.Config>, logger: Logger) =>
      helper.isSingleOrMain(cs) ? new GetTimeRangeService(cs, logger) : {},
    inject: [ConfigService]
  },
  {
    provide: GetFractionsService,
    useFactory: (cs: ConfigService<interfaces.Config>, logger: Logger) =>
      helper.isSingleOrMain(cs) ? new GetFractionsService(cs, logger) : {},
    inject: [ConfigService]
  },
  {
    provide: ConsumerMainService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      structService: RebuildStructService,
      processQueryService: ProcessQueryService,
      getTimeRangeService: GetTimeRangeService,
      getFractionsService: GetFractionsService,
      logger: Logger
    ) => {
      let result = helper.isSingleOrMain(cs)
        ? new ConsumerMainService(
            cs,
            structService,
            processQueryService,
            getTimeRangeService,
            getFractionsService,
            logger
          )
        : {};
      return result;
    },
    inject: [
      ConfigService,
      RebuildStructService,
      ProcessQueryService,
      GetTimeRangeService,
      GetFractionsService
    ]
  },
  {
    provide: ConsumerWorkerService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      genSqlService: GenSqlService,
      logger: Logger
    ) => {
      let isWorker = cs.get<interfaces.Config['isWorker']>('isWorker');

      return isWorker === common.BoolEnum.TRUE
        ? new ConsumerWorkerService(cs, genSqlService, logger)
        : {};
    },
    inject: [ConfigService, GenSqlService]
  }
];
