import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { AppModule } from '~disk/app.module';
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
    imports: [AppModule]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: key => mockConfig[key] })
    .overrideProvider(ConsumerService)
    .useValue({})
    .compile();

  app = moduleRef.createNestApplication();
  await app.init();

  let configService = moduleRef.get<ConfigService<interfaces.Config>>(
    ConfigService
  );

  let orgPath = configService.get<interfaces.Config['mDataOrgPath']>(
    'mDataOrgPath'
  );

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
