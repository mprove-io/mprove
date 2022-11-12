import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { Logger, LoggerModule, PinoLogger } from 'nestjs-pino';
import { appServices } from '~disk/app-services';
import { common } from '~disk/barrels/common';
import { interfaces } from '~disk/barrels/interfaces';
import { getConfig } from '~disk/config/get.config';
import { ConsumerService } from '~disk/services/consumer.service';
import { MessageService } from '~disk/services/message.service';

export async function prepareTest(
  orgId: string,
  overrideConfigOptions?: interfaces.Config
) {
  let app: INestApplication;

  let mockConfig = Object.assign(getConfig(), overrideConfigOptions);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        load: [getConfig],
        isGlobal: true
      }),

      LoggerModule.forRoot({
        pinoHttp: {
          transport:
            process.env.DISK_LOG_IS_STRINGIFY === common.BoolEnum.FALSE
              ? common.LOGGER_MODULE_TRANSPORT
              : undefined
        }
      })
    ],
    providers: appServices
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof interfaces.Config] })
    .overrideProvider(ConsumerService)
    .useValue({})
    .compile();

  app = moduleRef.createNestApplication();
  app.useLogger(app.get(Logger));
  await app.init();

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
  let pinoLogger = await moduleRef.resolve<PinoLogger>(PinoLogger);

  return {
    messageService: messageService,
    pinoLogger: pinoLogger
  };
}
