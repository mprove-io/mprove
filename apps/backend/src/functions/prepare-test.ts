import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  MCP_STRATEGY,
  McpStrategy,
  StreamableHttpTransport
} from '@rekog/mcp-nest';
import bodyParser from 'body-parser';
import { AppModule } from '#backend/app.module';
import { backendPackageJson } from '#backend/backend-package-json.js';
import { BackendConfig } from '#backend/config/backend-config';
import { getConfig } from '#backend/config/get.config';
import { Prep } from '#backend/interfaces/prep';
import { EmailService } from '#backend/services/email.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabToEntService } from '#backend/services/tab-to-ent.service';

import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendDeleteRecordsRequest } from '#common/types/backend/routes/test-routes/delete-records/delete-records-request';
import type { ToBackendSeedRecordsRequest } from '#common/types/backend/routes/test-routes/seed-records/seed-records-request';
import type { ToBackendLoginUserRequest } from '#common/types/backend/routes/users/login-user/login-user-request';
import type { ToBackendLoginUserResponse } from '#common/types/backend/routes/users/login-user/login-user-response';
import { sendToBackend } from './send-to-backend';

const { json, urlencoded } = bodyParser;

export async function prepareTest(item: {
  overrideConfigOptions?: Partial<BackendConfig>;
  mcpOptions?: {
    isValidateResponse?: boolean;
  };
}) {
  let { overrideConfigOptions, mcpOptions } = item;

  let extraOverride: Partial<BackendConfig> = {
    backendEnv: 'TEST',
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
    .overrideProvider(MCP_STRATEGY)
    .useFactory({
      inject: [StreamableHttpTransport],
      factory: (transport: StreamableHttpTransport): McpStrategy => {
        let strategy: McpStrategy = new McpStrategy({
          name: 'mprove',
          version: backendPackageJson.version,
          transports: [transport],
          isValidateResponse: isDefined(mcpOptions)
            ? mcpOptions.isValidateResponse
            : false,
          logging: false
        });

        return strategy;
      }
    })
    .overrideProvider(EmailService)
    .useValue({
      sendVerification: async () => {},
      sendResetPassword: async () => {},
      sendInviteToVerifiedUser: async () => {},
      sendInviteToUnverifiedUser: async () => {}
    })
    .compile();

  let app: INestApplication = moduleRef.createNestApplication();

  try {
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ limit: '50mb', extended: true }));

    let strategy: McpStrategy = app.get<McpStrategy>(MCP_STRATEGY);

    strategy.setHttpAdapter(app.getHttpAdapter());

    // HTTP-only global guards/interceptors stay at the HTTP layer. Tool-level
    // exception filters still run in the RPC pipeline.
    app.connectMicroservice({ strategy: strategy });

    await app.startAllMicroservices();

    await app.init();

    let httpServer = app.getHttpServer();

    let rpcService = moduleRef.get<RpcService>(RpcService);
    let tabToEntService = moduleRef.get<TabToEntService>(TabToEntService);
    let logger = await moduleRef.resolve<Logger>(Logger);
    let cs = await moduleRef.resolve<ConfigService>(ConfigService);

    let prep: Prep = {
      loginToken: undefined,
      app,
      httpServer,
      moduleRef,
      rpcService,
      tabToEntService,
      logger,
      cs
    };

    return prep;
  } catch (e) {
    await app.close();
    throw e;
  }
}

export async function prepareSeed(item: {
  httpServer: any;
  traceId: string;
  seedRecordsPayload?: ToBackendSeedRecordsRequest['input'];
  deleteRecordsPayload?: ToBackendDeleteRecordsRequest['input'];
  loginUserPayload?: ToBackendLoginUserRequest['input'];
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
      operation: 'deleteRecords',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: deleteRecordsPayload
    };
    await sendToBackend({
      route: 'api/ToBackendDeleteRecords',
      checkIsOk: true,
      httpServer: httpServer,
      req: deleteRecordsRequest
    }).catch(e => {
      throw e;
    });
  }

  if (isDefined(seedRecordsPayload)) {
    let seedRecordsRequest: ToBackendSeedRecordsRequest = {
      operation: 'seedRecords',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: seedRecordsPayload
    };

    await sendToBackend({
      route: 'api/ToBackendSeedRecords',
      checkIsOk: true,
      httpServer: httpServer,
      req: seedRecordsRequest
    }).catch(e => {
      throw e;
    });
  }

  let loginUserResp: ToBackendLoginUserResponse;

  if (isDefined(loginUserPayload)) {
    let loginUserRequest: ToBackendLoginUserRequest = {
      operation: 'loginUser',
      traceId: traceId,
      idempotencyKey: makeId(),
      input: loginUserPayload
    };

    loginUserResp = (await sendToBackend({
      route: 'api/ToBackendLoginUser',
      checkIsOk: true,
      httpServer: httpServer,
      req: loginUserRequest
    }).catch(e => {
      console.log(e);
      throw e;
    })) as ToBackendLoginUserResponse;
  }

  return {
    loginToken:
      loginUserResp?.type === 'Success' ? loginUserResp.output.token : undefined
  };
}

export async function prepareTestAndSeed(item: {
  traceId: string;
  seedRecordsPayload?: ToBackendSeedRecordsRequest['input'];
  deleteRecordsPayload?: ToBackendDeleteRecordsRequest['input'];
  overrideConfigOptions?: Partial<BackendConfig>;
  loginUserPayload?: ToBackendLoginUserRequest['input'];
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

  let prepareSeedResult;
  try {
    prepareSeedResult = await prepareSeed({
      httpServer: prep1.httpServer,
      traceId,
      seedRecordsPayload,
      deleteRecordsPayload,
      loginUserPayload
    });
  } catch (e) {
    await prep1.app.close();
    throw e;
  }

  let prep2: Prep = {
    loginToken: prepareSeedResult.loginToken,
    app: prep1.app,
    httpServer: prep1.httpServer,
    moduleRef: prep1.moduleRef,
    rpcService: prep1.rpcService,
    tabToEntService: prep1.tabToEntService,
    logger: prep1.logger,
    cs: prep1.cs
  };

  return prep2;
}
