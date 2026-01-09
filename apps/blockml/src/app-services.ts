import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '~blockml/config/blockml-config';
import { RebuildStructService } from './controllers/rebuild-struct/rebuild-struct.service';
import { BlockmlTabService } from './services/blockml-tab.service';
import { ConsumerMainService } from './services/consumer-main.service';
import { PresetsService } from './services/presets.service';

export const appServices = [
  BlockmlTabService,
  PresetsService,
  {
    provide: RebuildStructService,
    useFactory: (
      blockmlTabService: BlockmlTabService,
      presetsService: PresetsService,
      cs: ConfigService<BlockmlConfig>,
      logger: Logger
    ) =>
      new RebuildStructService(blockmlTabService, presetsService, cs, logger),
    inject: [BlockmlTabService, PresetsService, ConfigService]
  },
  {
    provide: ConsumerMainService,
    useFactory: (
      structService: RebuildStructService,
      cs: ConfigService<BlockmlConfig>,
      logger: Logger
    ) => new ConsumerMainService(structService, cs, logger),
    inject: [RebuildStructService, ConfigService]
  }
];
