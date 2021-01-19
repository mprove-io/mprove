import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { interfaces } from '../barrels/interfaces';
import { AppModule } from '../app.module';
import { MessageService } from '../services/message.service';
import { getConfig } from '../config/get.config';
import { api } from '../barrels/api';

export async function prepareTest(organizationId: string) {
  let app: INestApplication;

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true,
        validate: config => {
          api.transformValidSync({
            classType: interfaces.Config,
            object: getConfig(),
            errorMessage: api.ErEnum.M_DISK_WRONG_ENV_VALUES
          });
          return config;
        }
      })
    ],
    providers: [MessageService]
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();

  let configService = moduleRef.get<ConfigService<interfaces.Config>>(
    ConfigService
  );
  let orgPath = configService.get('mproveMDataOrganizationsPath');
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
