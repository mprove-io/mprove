import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import bodyParser from 'body-parser';
import { WinstonModule } from 'nest-winston';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import 'reflect-metadata';
import { MCP_STRATEGY, McpStrategy } from '@rekog/mcp-nest';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { OPEN_API_ALLOWED_PATHS } from '#common/constants/open-api-allowed-paths';
import {
  APP_NAME_BACKEND,
  APP_NAME_SCHEDULER
} from '#common/constants/top-backend';
import { getLoggerOptions } from '#node-common/functions/get-logger-options/get-logger-options';
import { listenProcessEvents } from '#node-common/functions/listen-process-events/listen-process-events';
import { startTelemetry } from '#node-common/functions/start-telemetry/start-telemetry';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';

let tracerNodeSdk = startTelemetry({
  serviceName:
    process.env.BACKEND_IS_SCHEDULER === 'TRUE'
      ? 'mprove-backend-scheduler'
      : 'mprove-backend'
});

const { json, urlencoded } = bodyParser;

async function bootstrap() {
  listenProcessEvents({
    tracerNodeSdk: tracerNodeSdk,
    appTerminated: 'BACKEND_APP_TERMINATED',
    uncaughtException: 'BACKEND_UNCAUGHT_EXCEPTION',
    unhandledRejectionReason: 'BACKEND_UNHANDLED_REJECTION_REASON',
    unhandledRejection: 'BACKEND_UNHANDLED_REJECTION_ERROR',
    logToConsoleFn: logToConsoleBackend
  });

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      getLoggerOptions({
        appName:
          config.isScheduler === true ? APP_NAME_SCHEDULER : APP_NAME_BACKEND,
        isJson: config.backendLogIsJson
      })
    )
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  let openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('mprove backend')
      .setVersion(config.mproveReleaseTag ?? 'dev')
      .addTag('Avatars')
      .addTag('Branches')
      .addTag('CachedColumns')
      .addTag('Catalogs')
      .addTag('Charts')
      .addTag('Check')
      .addTag('Connections')
      .addTag('Dashboards')
      .addTag('Envs')
      .addTag('Files')
      .addTag('Folders')
      .addTag('Givens')
      .addTag('Mconfigs')
      .addTag('Members')
      .addTag('Models')
      .addTag('Nav')
      .addTag('Orgs')
      .addTag('Projects')
      .addTag('Queries')
      .addTag('Reports')
      .addTag('Repos')
      .addTag('Run')
      .addTag('Sessions')
      .addTag('Skills')
      .addTag('Special')
      .addTag('State')
      .addTag('Structs')
      .addTag('SuggestFields')
      .addTag('Telemetry')
      .addTag('TestRoutes')
      .addTag('Users')
      .build(),
    {
      operationIdFactory: (controllerKey: string, _methodKey: string) =>
        controllerKey
    }
  );

  openApiDoc.paths = Object.fromEntries(
    Object.entries(openApiDoc.paths).filter(([path]) =>
      OPEN_API_ALLOWED_PATHS.has(path)
    )
  );

  SwaggerModule.setup('api/docs', app, cleanupOpenApiDoc(openApiDoc), {
    ui: false,
    jsonDocumentUrl: 'api/openapi.json'
  });

  app.enableCors({
    origin: [...config.hostUrl.split(',')],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'traceparent',
      'tracestate'
    ]
  });

  let strategy: McpStrategy = app.get<McpStrategy>(MCP_STRATEGY);

  strategy.setHttpAdapter(app.getHttpAdapter());

  // HTTP-only global guards/interceptors stay at the HTTP layer. Tool-level
  // exception filters still run in the RPC pipeline.
  app.connectMicroservice({ strategy: strategy });

  await app.startAllMicroservices();

  await app.listen(process.env.LISTEN_PORT || 3000);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
