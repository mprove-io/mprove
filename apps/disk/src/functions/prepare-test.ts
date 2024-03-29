import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { WinstonModule } from 'nest-winston';
import { appServices } from '~disk/app-services';
import { common } from '~disk/barrels/common';
import { constants } from '~disk/barrels/constants';
import { interfaces } from '~disk/barrels/interfaces';
import { nodeCommon } from '~disk/barrels/node-common';
import { getConfig } from '~disk/config/get.config';
import { ConsumerService } from '~disk/services/consumer.service';
import { MessageService } from '~disk/services/message.service';

export async function prepareTest(
  orgId: string,
  overrideConfigOptions?: interfaces.Config
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
        nodeCommon.getLoggerOptions({
          appName: constants.APP_NAME_DISK,
          isJson: config.diskLogIsJson === common.BoolEnum.TRUE
        })
      )
    ],
    providers: [Logger, ...appServices]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof interfaces.Config] })
    .overrideProvider(ConsumerService)
    .useValue({})
    .compile();

  // let app: INestApplication = moduleRef.createNestApplication();
  // await app.init();

  let cs = moduleRef.get<ConfigService<interfaces.Config>>(ConfigService);

  let orgPath = cs.get<interfaces.Config['diskOrganizationsPath']>(
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
