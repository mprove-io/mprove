import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { WinstonModule } from 'nest-winston';
import { APP_NAME_DISK } from '~common/constants/top-disk';
import { BoolEnum } from '~common/enums/bool.enum';
import { appServices } from '~disk/app-services';
import { DiskConfig } from '~disk/config/disk-config';
import { getConfig } from '~disk/config/get.config';
import { ConsumerService } from '~disk/services/consumer.service';
import { MessageService } from '~disk/services/message.service';
import { getLoggerOptions } from '~node-common/functions/get-logger-options';

export async function prepareTest(
  orgId: string,
  overrideConfigOptions?: DiskConfig
) {
  let config = getConfig();

  let mockConfig = Object.assign(config, overrideConfigOptions);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true
      }),
      WinstonModule.forRoot(
        getLoggerOptions({
          appName: APP_NAME_DISK,
          isJson: config.diskLogIsJson === BoolEnum.TRUE
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

  // let app: INestApplication = moduleRef.createNestApplication();
  // await app.init();

  let cs = moduleRef.get<ConfigService<DiskConfig>>(ConfigService);

  let orgPath = cs.get<DiskConfig['diskOrganizationsPath']>(
    'diskOrganizationsPath'
  );

  let orgDir = `${orgPath}/${orgId}`;

  let isOrgExist = fse.pathExistsSync(orgDir);
  if (isOrgExist === true) {
    fse.removeSync(orgDir);
  }

  let messageService = moduleRef.get<MessageService>(MessageService);
  let logger = await moduleRef.resolve<Logger>(Logger);

  return {
    messageService: messageService,
    logger: logger,
    cs: cs
  };
}
