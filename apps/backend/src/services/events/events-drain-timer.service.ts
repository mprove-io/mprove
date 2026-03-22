import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { EditorStreamService } from '../editor/editor-stream.service';
import { ExplorerStreamService } from '../explorer/explorer-stream.service';
import { EventsDrainService } from './events-drain.service';

@Injectable()
export class EventsDrainTimerService implements OnModuleDestroy {
  private isRunningDrain = false;

  private drainTimer: ReturnType<typeof setInterval>;

  private lockTimer: ReturnType<typeof setInterval>;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private eventsDrainService: EventsDrainService,
    private editorStreamService: EditorStreamService,
    private explorerStreamService: ExplorerStreamService,
    private logger: Logger
  ) {
    this.drainTimer = setInterval(async () => {
      if (this.isRunningDrain === false) {
        this.isRunningDrain = true;

        try {
          let safePauseSessionIds =
            await this.eventsDrainService.drainAllQueues();

          await this.editorStreamService.processSafePause({
            sessionIds: safePauseSessionIds
          });
        } catch (e) {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_DRAIN_QUEUES_FAILED,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        }

        this.editorStreamService.checkStreamStalls().catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_STREAM_STALL_CHECK_FAILED,
              originalError: e
            }),
            logLevel: LogLevelEnum.Error,
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
            message: ErEnum.BACKEND_AGENT_REFRESH_STREAM_LOCKS_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      this.editorStreamService.refreshActiveLocks().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: ErEnum.BACKEND_AGENT_REFRESH_STREAM_LOCKS_FAILED,
            originalError: e
          }),
          logLevel: LogLevelEnum.Error,
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
