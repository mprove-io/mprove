import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import { SessionDrainService } from '#backend/services/session/session-drain/session-drain.service';
import { ServerError } from '#common/classes/server-error/server-error';

@Injectable()
export class SessionDrainTimerService implements OnModuleDestroy {
  private isRunningDrain = false;

  private drainTimer: ReturnType<typeof setInterval>;

  private lockTimer: ReturnType<typeof setInterval>;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionDrainService: SessionDrainService,
    private editorStreamService: EditorStreamService,
    private explorerStreamService: ExplorerStreamService,
    private logger: Logger
  ) {
    this.drainTimer = setInterval(async () => {
      if (this.isRunningDrain === false) {
        this.isRunningDrain = true;

        try {
          let safePauseSessionIds =
            await this.sessionDrainService.drainAllQueues();

          await this.editorStreamService.processSafePause({
            sessionIds: safePauseSessionIds
          });
        } catch (e) {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_DRAIN_QUEUES_FAILED',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        }

        this.editorStreamService.checkStreamStalls().catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_STREAM_STALL_CHECK_FAILED',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });

        this.isRunningDrain = false;
      }
    }, 1000);

    this.lockTimer = setInterval(() => {
      this.explorerStreamService.refreshActiveLocks().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_REFRESH_STREAM_LOCKS_FAILED',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      });

      this.editorStreamService.refreshActiveLocks().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_REFRESH_STREAM_LOCKS_FAILED',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      });
    }, 2000);
  }

  onModuleDestroy() {
    clearInterval(this.drainTimer);
    clearInterval(this.lockTimer);
  }
}
