import 'reflect-metadata';
import { startTelemetry } from '#node-common/functions/start-telemetry';

let tracerNodeSdk = startTelemetry({
  serviceName:
    process.env.BACKEND_IS_SCHEDULER === 'TRUE'
      ? 'mprove-backend-scheduler'
      : 'mprove-backend'
});

//
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import bodyParser from 'body-parser';
import { cleanupOpenApiDoc } from 'nestjs-zod';

const { json, urlencoded } = bodyParser;

import { WinstonModule } from 'nest-winston';
import {
  APP_NAME_BACKEND,
  APP_NAME_SCHEDULER,
  OPEN_API_ALLOWED_PATHS
} from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { getLoggerOptions } from '#node-common/functions/get-logger-options';
import { listenProcessEvents } from '#node-common/functions/listen-process-events';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';
import { logToConsoleBackend } from './functions/log-to-console-backend';

async function bootstrap() {
  listenProcessEvents({
    tracerNodeSdk: tracerNodeSdk,
    appTerminated: ErEnum.BACKEND_APP_TERMINATED,
    uncaughtException: ErEnum.BACKEND_UNCAUGHT_EXCEPTION,
    unhandledRejectionReason: ErEnum.BACKEND_UNHANDLED_REJECTION_REASON,
    unhandledRejection: ErEnum.BACKEND_UNHANDLED_REJECTION_ERROR,
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
      .addTag('Catalogs')
      .addTag('Charts')
      .addTag('Check')
      .addTag('Connections')
      .addTag('Dashboards')
      .addTag('Envs')
      .addTag('Explorer')
      .addTag('Files')
      .addTag('Folders')
      .addTag('Mconfigs')
      .addTag('Members')
      .addTag('Models')
      .addTag('Nav')
      .addTag('OrgUsers')
      .addTag('Orgs')
      .addTag('Projects')
      .addTag('Queries')
      .addTag('QueryInfo')
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

  await app.listen(process.env.LISTEN_PORT || 3000);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
