import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PermissionReply, UniversalEvent } from 'sandbox-agent';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  EventTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ErEnum } from '#common/enums/er.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ServerError } from '#common/models/server-error';
import { AgentPubSubService } from './agent-pub-sub.service';
import { ProjectsService } from './db/projects.service';
import { SessionsService } from './db/sessions.service';
import { SandboxService } from './sandbox.service';

@Injectable()
export class AgentService {
  private activeStreams = new Map<string, AbortController>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private sandboxService: SandboxService,
    private agentPubSubService: AgentPubSubService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async stopSession(item: {
    sessionId: string;
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    this.stopEventStream(item.sessionId);

    await this.sandboxService.disposeClient(item.sessionId);

    await this.sandboxService.stopSandbox({
      sandboxType: item.sandboxType,
      sandboxId: item.sandboxId,
      e2bApiKey: item.e2bApiKey
    });
  }

  async pauseSession(item: {
    sessionId: string;
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    e2bApiKey: string;
  }): Promise<void> {
    this.stopEventStream(item.sessionId);

    await this.sandboxService.disposeClient(item.sessionId);

    await this.sandboxService.pauseSandbox({
      sandboxType: item.sandboxType,
      sandboxId: item.sandboxId,
      e2bApiKey: item.e2bApiKey
    });
  }

  async resumeSession(item: {
    sessionId: string;
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    sandboxBaseUrl: string;
    sandboxAgentToken: string;
    e2bApiKey: string;
    timeoutMs: number;
  }): Promise<void> {
    await this.sandboxService.resumeSandbox({
      sandboxType: item.sandboxType,
      sandboxId: item.sandboxId,
      e2bApiKey: item.e2bApiKey,
      timeoutMs: item.timeoutMs
    });

    await this.sandboxService.connectClient({
      sessionId: item.sessionId,
      sandboxBaseUrl: item.sandboxBaseUrl,
      sandboxAgentToken: item.sandboxAgentToken
    });

    this.startEventStream({
      sessionId: item.sessionId
    });
  }

  // Agent communication (SDK)

  async sendMessage(item: {
    sessionId: string;
    message: string;
  }): Promise<void> {
    let client = this.sandboxService.getClient(item.sessionId);

    await client
      .postMessage(item.sessionId, { message: item.message })
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_SEND_MESSAGE_FAILED,
          originalError: e
        });
      });
  }

  async respondToQuestion(item: {
    sessionId: string;
    questionId: string;
    answers: string[][];
  }): Promise<void> {
    let client = this.sandboxService.getClient(item.sessionId);

    await client
      .replyQuestion(item.sessionId, item.questionId, {
        answers: item.answers
      })
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_RESPOND_TO_QUESTION_FAILED,
          originalError: e
        });
      });
  }

  async respondToPermission(item: {
    sessionId: string;
    permissionId: string;
    reply: PermissionReply;
  }): Promise<void> {
    let client = this.sandboxService.getClient(item.sessionId);

    await client
      .replyPermission(item.sessionId, item.permissionId, {
        reply: item.reply
      })
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_RESPOND_TO_PERMISSION_FAILED,
          originalError: e
        });
      });
  }

  // Scheduled task

  async pauseIdleSessions(): Promise<void> {
    let idleMinutes =
      this.cs.get<BackendConfig['sandboxIdleMinutes']>('sandboxIdleMinutes');

    let idleThresholdTs = Date.now() - idleMinutes * 60 * 1000;

    let sessions = await this.sessionsService.getIdleActiveSessions({
      idleThresholdTs
    });

    for (let session of sessions) {
      if (
        session.lastActivityTs &&
        session.lastActivityTs < idleThresholdTs &&
        session.sandboxId
      ) {
        let project = await this.projectsService.getProjectCheckExists({
          projectId: session.projectId
        });

        await this.pauseSession({
          sessionId: session.sessionId,
          sandboxType: session.sandboxType as SandboxTypeEnum,
          sandboxId: session.sandboxId,
          e2bApiKey: project.e2bApiKey
        });

        let updatedSession: SessionTab = {
          ...session,
          status: SessionStatusEnum.Paused
        };

        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                sessions: [updatedSession]
              }
            })
        );
      }
    }
  }

  // stream

  startEventStream(item: { sessionId: string; offset?: number }): void {
    this.stopEventStream(item.sessionId);

    let abortController = new AbortController();
    this.activeStreams.set(item.sessionId, abortController);

    this.runEventStreamLoop({
      sessionId: item.sessionId,
      offset: item.offset ?? 0,
      signal: abortController.signal
    }).catch(e => {
      this.logger.warn(
        `Event stream ended for session ${item.sessionId}: ${e?.message}`
      );
    });
  }

  stopEventStream(sessionId: string): void {
    let controller = this.activeStreams.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(sessionId);
    }
  }

  private async runEventStreamLoop(item: {
    sessionId: string;
    offset: number;
    signal: AbortSignal;
  }): Promise<void> {
    let client = this.sandboxService.getClient(item.sessionId);
    let currentOffset = item.offset;

    let stream = client.streamEvents(
      item.sessionId,
      { offset: currentOffset },
      item.signal
    );

    for await (let event of stream) {
      if (item.signal.aborted) {
        break;
      }

      await this.storeEvent({
        sessionId: item.sessionId,
        event: event
      });

      currentOffset = event.sequence;
    }
  }

  private async storeEvent(item: {
    sessionId: string;
    event: UniversalEvent;
  }): Promise<void> {
    let now = Date.now();

    let eventTab = {
      eventId: item.event.event_id,
      sessionId: item.sessionId,
      sequence: item.event.sequence,
      type: item.event.type,
      universalEvent: item.event,
      createdTs: now,
      serverTs: now
    } as EventTab;

    await this.db.drizzle.transaction(async tx =>
      this.db.packer.write({
        tx: tx,
        insert: {
          events: [eventTab]
        }
      })
    );

    await this.agentPubSubService.publish(item.sessionId, {
      eventId: item.event.event_id,
      sequence: item.event.sequence,
      type: item.event.type,
      eventData: item.event.data
    });
  }
}
