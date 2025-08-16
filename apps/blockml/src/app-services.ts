import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { helper } from './barrels/helper';
import { interfaces } from './barrels/interfaces';
import { GetTimeRangeService } from './controllers/get-time-range/get-time-range.service';
import { RebuildStructService } from './controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerMainService } from './services/consumer-main.service';
import { PresetsService } from './services/presets.service';
import { RabbitService } from './services/rabbit.service';

export const appServices = [
  PresetsService,
  RabbitService,
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
    provide: GetTimeRangeService,
    useFactory: (cs: ConfigService<interfaces.Config>, logger: Logger) =>
      helper.isSingleOrMain(cs) ? new GetTimeRangeService(cs, logger) : {},
    inject: [ConfigService]
  },
  {
    provide: ConsumerMainService,
    useFactory: (
      cs: ConfigService<interfaces.Config>,
      structService: RebuildStructService,
      getTimeRangeService: GetTimeRangeService,
      logger: Logger
    ) => {
      let result = helper.isSingleOrMain(cs)
        ? new ConsumerMainService(
            cs,
            structService,
            getTimeRangeService,
            logger
          )
        : {};
      return result;
    },
    inject: [ConfigService, RebuildStructService, GetTimeRangeService]
  }
];
