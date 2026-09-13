import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BlockmlConfig } from '#blockml/config/blockml-config';
import { RebuildStructService } from './controllers/rebuild-struct/rebuild-struct.service';
import { BlockmlTabService } from './services/blockml-tab.service';
import { ConsumerService } from './services/consumer.service';
import { MessageService } from './services/message.service';
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
    inject: [BlockmlTabService, PresetsService, ConfigService, Logger]
  },
  MessageService,
  {
    provide: ConsumerService,
    useFactory: (
      messageService: MessageService,
      cs: ConfigService<BlockmlConfig>
    ) => new ConsumerService(messageService, cs),
    inject: [MessageService, ConfigService]
  }
];
