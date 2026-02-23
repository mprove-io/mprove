import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import fse from 'fs-extra';
import { WinstonModule } from 'nest-winston';
import { APP_NAME_DISK } from '#common/constants/top-disk';
import { DiskEnvEnum } from '#common/enums/env/disk-env.enum';
import { appServices } from '#disk/app-services';
import { DiskConfig } from '#disk/config/disk-config';
import { getConfig } from '#disk/config/get.config';
import { ConsumerService } from '#disk/services/consumer.service';
import { DiskTabService } from '#disk/services/disk-tab.service';
import { MessageService } from '#disk/services/message.service';
import { getLoggerOptions } from '#node-common/functions/get-logger-options';

export async function prepareTest(
  orgId: string,
  overrideConfigOptions?: DiskConfig
) {
  let extraOverride: DiskConfig = {
    diskEnv: DiskEnvEnum.TEST,
    diskLogResponseError: true,
    ...overrideConfigOptions
  };

  let config = getConfig();

  let mockConfig = Object.assign(config, extraOverride);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true
      }),
      WinstonModule.forRoot(
        getLoggerOptions({
          appName: APP_NAME_DISK,
          isJson: config.diskLogIsJson
        })
      )
    ],
    providers: [Logger, ...appServices]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof DiskConfig] })
    .overrideProvider(ConsumerService)
    .useValue({})
    .compile();

  let cs = moduleRef.get<ConfigService<DiskConfig>>(ConfigService);

  let orgPath = cs.get<DiskConfig['diskOrganizationsPath']>(
    'diskOrganizationsPath'
  );

  let orgDir = `${orgPath}/${orgId}`;

  let isOrgExist = fse.pathExistsSync(orgDir);
  if (isOrgExist === true) {
    // Use async removal with retry to handle locked files from git processes
    await fse.remove(orgDir);
  }

  let messageService = moduleRef.get<MessageService>(MessageService);
  let diskTabService = moduleRef.get<DiskTabService>(DiskTabService);
  let logger = await moduleRef.resolve<Logger>(Logger);

  return {
    messageService: messageService,
    diskTabService: diskTabService,
    logger: logger,
    cs: cs
  };
}
