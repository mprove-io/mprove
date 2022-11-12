import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PinoLogger } from 'nestjs-pino';
import { AppModule } from '~backend/app.module';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { enums } from '~backend/barrels/enums';
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

  let extraOverride: interfaces.Config = {
    backendEnv: enums.BackendEnvEnum.TEST
  };

  let mockConfig = Object.assign(
    getConfig(),
    overrideConfigOptions,
    extraOverride
  );

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof interfaces.Config] })
    .overrideProvider(MailerService)
    .useValue({ sendMail: async () => {} })
    .compile();

  let app = moduleRef.createNestApplication();
  await app.init();
  let httpServer = app.getHttpServer();

  if (common.isDefined(deleteRecordsPayload)) {
    let deleteRecordsRequest: apiToBackend.ToBackendDeleteRecordsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: deleteRecordsPayload
    };

    await helper.sendToBackend<apiToBackend.ToBackendDeleteRecordsResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: deleteRecordsRequest
    });
  }

  if (common.isDefined(seedRecordsPayload)) {
    let seedRecordsRequest: apiToBackend.ToBackendSeedRecordsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: seedRecordsPayload
    };

    await helper.sendToBackend<apiToBackend.ToBackendSeedRecordsResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: seedRecordsRequest
    });
  }

  let loginUserResp: apiToBackend.ToBackendLoginUserResponse;

  if (common.isDefined(loginUserPayload)) {
    let loginUserRequest: apiToBackend.ToBackendLoginUserRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        traceId: traceId,
        idempotencyKey: common.makeId()
      },
      payload: loginUserPayload
    };

    loginUserResp =
      await helper.sendToBackend<apiToBackend.ToBackendLoginUserResponse>({
        checkIsOk: true,
        httpServer: httpServer,
        req: loginUserRequest
      });
  }

  let rabbitService = moduleRef.get<RabbitService>(RabbitService);
  let pinoLogger = await moduleRef.resolve<PinoLogger>(PinoLogger);

  let prep: interfaces.Prep = {
    app,
    httpServer,
    moduleRef,
    rabbitService,
    pinoLogger,
    loginToken: loginUserResp?.payload?.token
  };

  return prep;
}
