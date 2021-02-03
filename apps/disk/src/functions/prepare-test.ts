import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { appServices } from '~disk/app-services';
import { interfaces } from '~disk/barrels/interfaces';
import { getConfig } from '~disk/config/get.config';
import { ConsumerService } from '~disk/services/consumer.service';
import { MessageService } from '~disk/services/message.service';

export async function prepareTest(
  organizationId: string,
  overrideConfigOptions?: interfaces.Config
) {
  let app: INestApplication;

  let mockConfig = Object.assign(getConfig(), overrideConfigOptions);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true
      })
    ],
    providers: appServices
  })
    .overrideProvider(ConfigService)
    .useValue({ get: key => mockConfig[key] })
    .overrideProvider(ConsumerService)
    .useValue({})
    .compile();

  app = moduleRef.createNestApplication();
  await app.init();

  let cs = moduleRef.get<ConfigService<interfaces.Config>>(ConfigService);

  let orgPath = cs.get<interfaces.Config['mDataOrgPath']>('mDataOrgPath');

  let orgDir = `${orgPath}/${organizationId}`;

  let isOrgExist = fse.pathExistsSync(orgDir);
  if (isOrgExist === true) {
    fse.removeSync(orgDir);
  }

  let messageService = moduleRef.get<MessageService>(MessageService);

  return {
    messageService: messageService
  };
}
