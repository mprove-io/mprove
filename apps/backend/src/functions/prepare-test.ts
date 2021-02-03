import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '~backend/app.module';
import { api } from '~backend/barrels/api';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { getConfig } from '~backend/config/get.config';
import { RabbitService } from '~backend/services/rabbit.service';

export async function prepareTest(item: {
  traceId: string;
  seedRecordsPayload?: api.ToBackendSeedRecordsRequestPayload;
  deleteRecordsPayload?: api.ToBackendDeleteRecordsRequestPayload;
  overrideConfigOptions?: interfaces.Config;
  loginUserPayload?: api.ToBackendLoginUserRequestPayload;
}) {
  let {
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    overrideConfigOptions,
    loginUserPayload
  } = item;

  let mockConfig = Object.assign(getConfig(), overrideConfigOptions);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: key => mockConfig[key] })
    .overrideProvider(MailerService)
    .useValue({ sendMail: async () => {} })
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

  let loginUserResp: api.ToBackendLoginUserResponse;

  if (helper.isDefined(loginUserPayload)) {
    loginUserResp = await helper.sendToBackend<api.ToBackendLoginUserResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: <api.ToBackendLoginUserRequest>{
        info: {
          name: api.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
          traceId: traceId
        },
        payload: loginUserPayload
      }
    });
  }

  let rabbitService = moduleRef.get<RabbitService>(RabbitService);

  let prep: interfaces.Prep = {
    app,
    httpServer,
    moduleRef,
    rabbitService,
    loginToken: loginUserResp?.payload?.token
  };

  return prep;
}
