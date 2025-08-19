import { MailerService } from '@nestjs-modules/mailer';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '~backend/app.module';

import { getConfig } from '~backend/config/get.config';
import { RabbitService } from '~backend/services/rabbit.service';

export async function prepareTest(item: {
  overrideConfigOptions?: BackendConfig;
}) {
  let { overrideConfigOptions } = item;

  let extraOverride: BackendConfig = {
    backendEnv: BackendEnvEnum.TEST
  };

  let config = getConfig();

  let mockConfig = Object.assign(config, overrideConfigOptions, extraOverride);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof BackendConfig] })
    .overrideProvider(MailerService)
    .useValue({ sendMail: async () => {} })
    .compile();

  let app: INestApplication = moduleRef.createNestApplication();
  await app.init();

  let httpServer = app.getHttpServer();

  let rabbitService = moduleRef.get<RabbitService>(RabbitService);
  let logger = await moduleRef.resolve<Logger>(Logger);
  let cs = await moduleRef.resolve<ConfigService>(ConfigService);

  let prep: interfaces.Prep = {
    loginToken: undefined,
    app,
    httpServer,
    moduleRef,
    rabbitService,
    logger,
    cs
  };

  return prep;
}

export async function prepareSeed(item: {
  httpServer: any;
  traceId: string;
  seedRecordsPayload?: apiToBackend.ToBackendSeedRecordsRequestPayload;
  deleteRecordsPayload?: apiToBackend.ToBackendDeleteRecordsRequestPayload;
  loginUserPayload?: apiToBackend.ToBackendLoginUserRequestPayload;
}) {
  let {
    httpServer,
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    loginUserPayload
  } = item;

  if (isDefined(deleteRecordsPayload)) {
    let deleteRecordsRequest: apiToBackend.ToBackendDeleteRecordsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: deleteRecordsPayload
    };
    await helper
      .sendToBackend<apiToBackend.ToBackendDeleteRecordsResponse>({
        checkIsOk: true,
        httpServer: httpServer,
        req: deleteRecordsRequest
      })
      .catch(e => {
        console.log(e);
      });
  }

  if (isDefined(seedRecordsPayload)) {
    let seedRecordsRequest: apiToBackend.ToBackendSeedRecordsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: seedRecordsPayload
    };

    await helper
      .sendToBackend<apiToBackend.ToBackendSeedRecordsResponse>({
        checkIsOk: true,
        httpServer: httpServer,
        req: seedRecordsRequest
      })
      .catch(e => {
        console.log(e);
      });
  }

  let loginUserResp: apiToBackend.ToBackendLoginUserResponse;

  if (isDefined(loginUserPayload)) {
    let loginUserRequest: apiToBackend.ToBackendLoginUserRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: loginUserPayload
    };

    loginUserResp = (await helper
      .sendToBackend<apiToBackend.ToBackendLoginUserResponse>({
        checkIsOk: true,
        httpServer: httpServer,
        req: loginUserRequest
      })
      .catch(e => {
        console.log(e);
      })) as apiToBackend.ToBackendLoginUserResponse;
  }

  return {
    loginToken: loginUserResp?.payload?.token
  };
}

export async function prepareTestAndSeed(item: {
  traceId: string;
  seedRecordsPayload?: apiToBackend.ToBackendSeedRecordsRequestPayload;
  deleteRecordsPayload?: apiToBackend.ToBackendDeleteRecordsRequestPayload;
  overrideConfigOptions?: BackendConfig;
  loginUserPayload?: apiToBackend.ToBackendLoginUserRequestPayload;
}) {
  let {
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    overrideConfigOptions,
    loginUserPayload
  } = item;

  let prep1: interfaces.Prep = await prepareTest({
    overrideConfigOptions: overrideConfigOptions
  });

  let prepareSeedResult = await prepareSeed({
    httpServer: prep1.httpServer,
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    loginUserPayload
  });

  let prep2: interfaces.Prep = {
    loginToken: prepareSeedResult.loginToken,
    app: prep1.app,
    httpServer: prep1.httpServer,
    moduleRef: prep1.moduleRef,
    rabbitService: prep1.rabbitService,
    logger: prep1.logger,
    cs: prep1.cs
  };

  return prep2;
}
