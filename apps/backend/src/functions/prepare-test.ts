import { MailerService } from '@nestjs-modules/mailer';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '~backend/app.module';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { enums } from '~backend/barrels/enums';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { getConfig } from '~backend/config/get.config';
import { RabbitService } from '~backend/services/rabbit.service';

export async function prepareTest(item: {
  overrideConfigOptions?: interfaces.Config;
}) {
  let { overrideConfigOptions } = item;

  let extraOverride: interfaces.Config = {
    backendEnv: enums.BackendEnvEnum.TEST
  };

  let config = getConfig();

  let mockConfig = Object.assign(config, overrideConfigOptions, extraOverride);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof interfaces.Config] })
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

  if (common.isDefined(deleteRecordsPayload)) {
    let deleteRecordsRequest: apiToBackend.ToBackendDeleteRecordsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
        traceId: traceId,
        idempotencyKey: common.makeId()
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

  if (common.isDefined(seedRecordsPayload)) {
    let seedRecordsRequest: apiToBackend.ToBackendSeedRecordsRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
        traceId: traceId,
        idempotencyKey: common.makeId()
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

  if (common.isDefined(loginUserPayload)) {
    let loginUserRequest: apiToBackend.ToBackendLoginUserRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        traceId: traceId,
        idempotencyKey: common.makeId()
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
