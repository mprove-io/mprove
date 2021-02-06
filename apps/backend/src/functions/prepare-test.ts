import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '~backend/app.module';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { getConfig } from '~backend/config/get.config';
import { RabbitService } from '~backend/services/rabbit.service';

export async function prepareTest(item: {
  traceId: string;
  seedRecordsPayload?: apiToBackend.ToBackendSeedRecordsRequestPayload;
  deleteRecordsPayload?: apiToBackend.ToBackendDeleteRecordsRequestPayload;
  overrideConfigOptions?: interfaces.Config;
  loginUserPayload?: apiToBackend.ToBackendLoginUserRequestPayload;
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
    await helper.sendToBackend<apiToBackend.ToBackendDeleteRecordsResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: <apiToBackend.ToBackendDeleteRecordsRequest>{
        info: {
          name:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
          traceId: traceId
        },
        payload: deleteRecordsPayload
      }
    });
  }

  if (helper.isDefined(seedRecordsPayload)) {
    await helper.sendToBackend<apiToBackend.ToBackendSeedRecordsResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: <apiToBackend.ToBackendSeedRecordsRequest>{
        info: {
          name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
          traceId: traceId
        },
        payload: seedRecordsPayload
      }
    });
  }

  let loginUserResp: apiToBackend.ToBackendLoginUserResponse;

  if (helper.isDefined(loginUserPayload)) {
    loginUserResp = await helper.sendToBackend<apiToBackend.ToBackendLoginUserResponse>(
      {
        checkIsOk: true,
        httpServer: httpServer,
        req: <apiToBackend.ToBackendLoginUserRequest>{
          info: {
            name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
            traceId: traceId
          },
          payload: loginUserPayload
        }
      }
    );
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
