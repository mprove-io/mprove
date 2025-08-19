import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~common/interfaces/blockml/blockml-config';
import { RebuildStructService } from './controllers/rebuild-struct/rebuild-struct.service';
import { isSingleOrMain } from './functions/extra/is-single-or-main';
import { ConsumerMainService } from './services/consumer-main.service';
import { PresetsService } from './services/presets.service';
import { RabbitService } from './services/rabbit.service';

export const appServices = [
  PresetsService,
  RabbitService,
  {
    provide: RebuildStructService,
    useFactory: (
      cs: ConfigService<BlockmlConfig>,
      rabbitService: RabbitService,
      presetsService: PresetsService,
      logger: Logger
    ) =>
      isSingleOrMain(cs)
        ? new RebuildStructService(rabbitService, presetsService, cs, logger)
        : {},
    inject: [ConfigService, RabbitService, PresetsService]
  },
  {
    provide: ConsumerMainService,
    useFactory: (
      cs: ConfigService<BlockmlConfig>,
      structService: RebuildStructService,
      logger: Logger
    ) => {
      let result = isSingleOrMain(cs)
        ? new ConsumerMainService(cs, structService, logger)
        : {};
      return result;
    },
    inject: [ConfigService, RebuildStructService]
  }
];
