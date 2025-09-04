import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { RebuildStructService } from './controllers/rebuild-struct/rebuild-struct.service';
import { ConsumerMainService } from './services/consumer-main.service';
import { PresetsService } from './services/presets.service';

export const appServices = [
  PresetsService,
  {
    provide: RebuildStructService,
    useFactory: (
      cs: ConfigService<BlockmlConfig>,
      presetsService: PresetsService,
      logger: Logger
    ) => new RebuildStructService(presetsService, cs, logger),
    inject: [ConfigService, PresetsService]
  },
  {
    provide: ConsumerMainService,
    useFactory: (
      cs: ConfigService<BlockmlConfig>,
      structService: RebuildStructService,
      logger: Logger
    ) => new ConsumerMainService(cs, structService, logger),
    inject: [ConfigService, RebuildStructService]
  }
];
