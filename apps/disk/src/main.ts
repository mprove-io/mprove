import 'reflect-metadata';
import { Result } from '@praha/byethrow';
import { startTelemetry } from '#node-common/functions/start-telemetry';

let tracerNodeSdk = startTelemetry({
  serviceName: 'mprove-disk'
});

//
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { APP_NAME_DISK } from '#common/constants/top-disk';
import { ErEnum } from '#common/enums/er.enum';
import { getLoggerOptions } from '#node-common/functions/get-logger-options';
import { listenProcessEvents } from '#node-common/functions/listen-process-events';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';
import { checkSymlinksInDir } from './functions/disk/check-symlinks-in-dir';
import { logToConsoleDisk } from './functions/log-to-console-disk';

async function bootstrap(): Promise<void> {
  listenProcessEvents({
    tracerNodeSdk: tracerNodeSdk,
    appTerminated: ErEnum.DISK_APP_TERMINATED,
    uncaughtException: ErEnum.DISK_UNCAUGHT_EXCEPTION,
    unhandledRejectionReason: ErEnum.DISK_UNHANDLED_REJECTION_REASON,
    unhandledRejection: ErEnum.DISK_UNHANDLED_REJECTION_ERROR,
    logToConsoleFn: logToConsoleDisk
  });

  let config = getConfig();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(
      getLoggerOptions({
        appName: APP_NAME_DISK,
        isJson: config.diskLogIsJson
      })
    )
  });

  if (config.diskIsCheckSymlinksOnStartup === true) {
    await Result.unwrap(
      Result.pipe(
        checkSymlinksInDir({ dir: config.diskOrganizationsPath }),
        Result.mapError(error => {
          switch (error.code) {
            case 'DISK_SYMLINKS_FOUND':
              return new Error(
                `Symlinks found under ${error.displayData.dir}. Remove them before starting disk:\n${error.displayData.symlinks.join('\n')}`
              );

            default: {
              let unhandled: never = error.code;

              throw new Error(`Unhandled startup error: ${unhandled}`);
            }
          }
        })
      )
    );
  }

  await app.listen(process.env.LISTEN_PORT || 3002);
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
