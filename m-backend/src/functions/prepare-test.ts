import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '~/app.module';
import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { getConfig } from '~/config/get.config';
import { RabbitService } from '~/services/rabbit.service';

export async function prepareTest(item: {
  traceId: string;
  seedRecordsPayload?: api.ToBackendSeedRecordsRequestPayload;
  deleteRecordsPayload?: api.ToBackendDeleteRecordsRequestPayload;
  overrideConfigOptions?: interfaces.Config;
}) {
  let {
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    overrideConfigOptions
  } = item;

  let mockConfig = Object.assign(getConfig(), overrideConfigOptions);
  const mockConfigService = { get: key => mockConfig[key] };

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(ConfigService)
    .useValue(mockConfigService)
    .compile();

  let app = moduleRef.createNestApplication();
  await app.init();
  let httpServer = app.getHttpServer();

  if (helper.isDefined(deleteRecordsPayload)) {
    await helper.sendToBackend<api.ToBackendDeleteRecordsResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: <api.ToBackendDeleteRecordsRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
          traceId: traceId
        },
        payload: deleteRecordsPayload
      }
    });
  }

  if (helper.isDefined(seedRecordsPayload)) {
    await helper.sendToBackend<api.ToBackendSeedRecordsResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: <api.ToBackendSeedRecordsRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
          traceId: traceId
        },
        payload: seedRecordsPayload
      }
    });
  }

  let rabbitService = moduleRef.get<RabbitService>(RabbitService);

  let prep: interfaces.Prep = { app, httpServer, moduleRef, rabbitService };

  return prep;
}
