import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { AgentDrainService } from './agent-drain.service';
import { AgentStreamAiService } from './agent-stream-ai.service';
import { AgentStreamOpencodeService } from './agent-stream-opencode.service';

@Injectable()
export class AgentDrainTimerService implements OnModuleDestroy {
  private isRunningDrain = false;

  private drainTimer: ReturnType<typeof setInterval>;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private agentDrainService: AgentDrainService,
    private agentStreamOpencodeService: AgentStreamOpencodeService,
    private agentStreamAiService: AgentStreamAiService,
    private logger: Logger
  ) {
    this.drainTimer = setInterval(async () => {
      if (this.isRunningDrain === false) {
        this.isRunningDrain = true;

        try {
          let safePauseSessionIds =
            await this.agentDrainService.drainAllQueues();

          await this.agentStreamOpencodeService.processSafePause({
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

        this.agentStreamAiService.refreshActiveLocks().catch(e => {
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

        this.agentStreamOpencodeService.refreshActiveLocks().catch(e => {
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

        this.agentStreamOpencodeService.checkStreamStalls().catch(e => {
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
