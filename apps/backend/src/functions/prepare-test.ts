import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '~backend/app.module';
import { BackendConfig } from '~backend/config/backend-config';
import { getConfig } from '~backend/config/get.config';
import { Prep } from '~backend/interfaces/prep';
import { EmailService } from '~backend/services/email.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { TabToEntService } from '~backend/services/tab-to-ent.service';
import { BackendEnvEnum } from '~common/enums/env/backend-env.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendDeleteRecordsRequest,
  ToBackendDeleteRecordsRequestPayload,
  ToBackendDeleteRecordsResponse
} from '~common/interfaces/to-backend/test-routes/to-backend-delete-records';
import {
  ToBackendSeedRecordsRequest,
  ToBackendSeedRecordsRequestPayload,
  ToBackendSeedRecordsResponse
} from '~common/interfaces/to-backend/test-routes/to-backend-seed-records';
import {
  ToBackendLoginUserRequest,
  ToBackendLoginUserRequestPayload,
  ToBackendLoginUserResponse
} from '~common/interfaces/to-backend/users/to-backend-login-user';
import { sendToBackend } from './send-to-backend';

export async function prepareTest(item: {
  overrideConfigOptions?: BackendConfig;
}) {
  let { overrideConfigOptions } = item;

  let extraOverride: BackendConfig = {
    backendEnv: BackendEnvEnum.TEST,
    backendLogResponseOk: false,
    backendLogResponseError: false
  };

  let config = getConfig();

  let mockConfig = Object.assign(config, overrideConfigOptions, extraOverride);

  let moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: any) => mockConfig[key as keyof BackendConfig] })
    .overrideProvider(EmailService)
    .useValue({
      sendVerification: async () => {},
      sendResetPassword: async () => {},
      sendInviteToVerifiedUser: async () => {},
      sendInviteToUnverifiedUser: async () => {}
    })
    .compile();

  let app: INestApplication = moduleRef.createNestApplication();
  await app.init();

  let httpServer = app.getHttpServer();

  let rabbitService = moduleRef.get<RabbitService>(RabbitService);
  let tabToEntService = moduleRef.get<TabToEntService>(TabToEntService);
  let logger = await moduleRef.resolve<Logger>(Logger);
  let cs = await moduleRef.resolve<ConfigService>(ConfigService);

  let prep: Prep = {
    loginToken: undefined,
    app,
    httpServer,
    moduleRef,
    rabbitService,
    tabToEntService,
    logger,
    cs
  };

  return prep;
}

export async function prepareSeed(item: {
  httpServer: any;
  traceId: string;
  seedRecordsPayload?: ToBackendSeedRecordsRequestPayload;
  deleteRecordsPayload?: ToBackendDeleteRecordsRequestPayload;
  loginUserPayload?: ToBackendLoginUserRequestPayload;
}) {
  let {
    httpServer,
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    loginUserPayload
  } = item;

  if (isDefined(deleteRecordsPayload)) {
    let deleteRecordsRequest: ToBackendDeleteRecordsRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendDeleteRecords,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: deleteRecordsPayload
    };
    await sendToBackend<ToBackendDeleteRecordsResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: deleteRecordsRequest
    }).catch(e => {
      console.log(e);
    });
  }

  if (isDefined(seedRecordsPayload)) {
    let seedRecordsRequest: ToBackendSeedRecordsRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendSeedRecords,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: seedRecordsPayload
    };

    await sendToBackend<ToBackendSeedRecordsResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: seedRecordsRequest
    }).catch(e => {
      console.log(e);
    });
  }

  let loginUserResp: ToBackendLoginUserResponse;

  if (isDefined(loginUserPayload)) {
    let loginUserRequest: ToBackendLoginUserRequest = {
      info: {
        name: ToBackendRequestInfoNameEnum.ToBackendLoginUser,
        traceId: traceId,
        idempotencyKey: makeId()
      },
      payload: loginUserPayload
    };

    loginUserResp = (await sendToBackend<ToBackendLoginUserResponse>({
      checkIsOk: true,
      httpServer: httpServer,
      req: loginUserRequest
    }).catch(e => {
      console.log(e);
    })) as ToBackendLoginUserResponse;
  }

  return {
    loginToken: loginUserResp?.payload?.token
  };
}

export async function prepareTestAndSeed(item: {
  traceId: string;
  seedRecordsPayload?: ToBackendSeedRecordsRequestPayload;
  deleteRecordsPayload?: ToBackendDeleteRecordsRequestPayload;
  overrideConfigOptions?: BackendConfig;
  loginUserPayload?: ToBackendLoginUserRequestPayload;
}) {
  let {
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    overrideConfigOptions,
    loginUserPayload
  } = item;

  let prep1: Prep = await prepareTest({
    overrideConfigOptions: overrideConfigOptions
  });

  let prepareSeedResult = await prepareSeed({
    httpServer: prep1.httpServer,
    traceId,
    seedRecordsPayload,
    deleteRecordsPayload,
    loginUserPayload
  });

  let prep2: Prep = {
    loginToken: prepareSeedResult.loginToken,
    app: prep1.app,
    httpServer: prep1.httpServer,
    moduleRef: prep1.moduleRef,
    rabbitService: prep1.rabbitService,
    tabToEntService: prep1.tabToEntService,
    logger: prep1.logger,
    cs: prep1.cs
  };

  return prep2;
}
