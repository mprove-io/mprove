import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { AgentStreamService } from './agent-stream.service';
import { AgentStreamDrainService } from './agent-stream-drain.service';
import { AiSdkStreamService } from './ai-sdk-stream.service';

@Injectable()
export class AgentDrainService implements OnModuleDestroy {
  private isRunningDrain = false;

  private drainTimer: ReturnType<typeof setInterval>;

  constructor(
    private agentStreamDrainService: AgentStreamDrainService,
    private agentStreamService: AgentStreamService,
    private aiSdkStreamService: AiSdkStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {
    this.drainTimer = setInterval(async () => {
      if (this.isRunningDrain === false) {
        this.isRunningDrain = true;

        try {
          let safePauseSessionIds =
            await this.agentStreamDrainService.drainAllQueues();

          await this.agentStreamService.processSafePause({
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

        this.aiSdkStreamService.refreshActiveLocks().catch(e => {
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

        this.agentStreamService.refreshActiveLocks().catch(e => {
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

        this.agentStreamService.checkStreamStalls().catch(e => {
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
  }

  onModuleDestroy() {
    clearInterval(this.drainTimer);
  }
}
