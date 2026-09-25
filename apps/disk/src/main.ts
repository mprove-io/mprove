import 'reflect-metadata';
import { Result } from '@praha/byethrow';
import { startTelemetry } from '#node-common/functions/start-telemetry/start-telemetry';

let tracerNodeSdk = startTelemetry({
  serviceName: 'mprove-disk'
});

//
import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { APP_NAME_DISK } from '#common/constants/top-disk';
import { ErEnum } from '#common/enums/er.enum';
import type { DiskCheckSymlinksInDirError } from '#common/zod/disk/function-errors/disk-check-symlinks-in-dir-error';
import { getLoggerOptions } from '#node-common/functions/get-logger-options/get-logger-options';
import { listenProcessEvents } from '#node-common/functions/listen-process-events/listen-process-events';
import { AppModule } from './app.module';
import { getConfig } from './config/get.config';
import { checkSymlinksInDir } from './functions/disk/check-symlinks-in-dir/check-symlinks-in-dir';
import { logToConsoleDisk } from './functions/top/log-to-console-disk/log-to-console-disk';

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
        Result.succeed({
          diskOrganizationsPath: config.diskOrganizationsPath
        }),
        Result.andThen(
          (v): Result.ResultAsync<void, DiskCheckSymlinksInDirError> =>
            checkSymlinksInDir({ dir: v.diskOrganizationsPath })
        ),
        Result.mapError(v => {
          switch (v.code) {
            case 'DISK_SYMLINKS_FOUND':
              return new Error(
                `Symlinks found under ${v.displayData.dir}. Remove them before starting disk:\n${v.displayData.symlinks.join('\n')}`
              );

            default: {
              let unhandled: never = v.code;

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
