import { type INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import {
  MCP_STRATEGY,
  McpStrategy,
  StreamableHttpTransport
} from '@rekog/mcp-nest';
import bodyParser from 'body-parser';
import { AppModule } from '#backend/app.module';
import { backendPackageJson } from '#backend/backend-package-json.js';
import type { BackendConfig } from '#backend/config/backend-config';
import { getConfig } from '#backend/config/get.config';
import type { Prep } from '#backend/interfaces/prep';
import { EmailService } from '#backend/services/email/email.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabToEntService } from '#backend/services/tab-to-ent/tab-to-ent.service';
import { isDefined } from '#common/functions/is-defined/is-defined';

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
