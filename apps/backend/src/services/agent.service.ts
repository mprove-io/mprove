import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  PermissionReply,
  SandboxAgent,
  UniversalEvent
} from 'sandbox-agent';
import { v4 as uuidv4 } from 'uuid';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  EventTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
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

  // Session creation (combines sandbox + agent session)

  async createSession(item: {
    sandboxType: SandboxTypeEnum;
    e2bApiKey: string;
    sandboxTimeoutMs: number;
    userId: string;
    projectId: string;
    agent: string;
    agentMode?: string;
    permissionMode?: string;
    zenApiKey?: string;
  }) {
    let sandboxEnvs: Record<string, string> = {};

    if (item.zenApiKey) {
      sandboxEnvs.ZEN_API_KEY = item.zenApiKey;
    }

    let { sandboxId, sandboxBaseUrl, sandboxAgentToken } =
      await this.sandboxService.createSandbox({
        sandboxType: item.sandboxType,
        sandboxTimeoutMs: item.sandboxTimeoutMs,
        agent: item.agent,
        sandboxEnvs: sandboxEnvs,
        e2bApiKey: item.e2bApiKey
      });

    let sessionId = uuidv4();

    let sdkCreateSessionResponse = await this.createAgentSession({
      sessionId: sessionId,
      sandboxBaseUrl: sandboxBaseUrl,
      sandboxAgentToken: sandboxAgentToken,
      agent: item.agent,
      agentMode: item.agentMode,
      permissionMode: item.permissionMode
    });

    let now = Date.now();

    let session: SessionTab = this.sessionsService.makeSession({
      sessionId: sessionId,
      userId: item.userId,
      projectId: item.projectId,
      sandboxType: item.sandboxType,
      agent: item.agent,
      agentMode: item.agentMode,
      permissionMode: item.permissionMode,
      sandboxId: sandboxId,
      sandboxBaseUrl: sandboxBaseUrl,
      sandboxAgentToken: sandboxAgentToken,
      sdkCreateSessionResponse: sdkCreateSessionResponse,
      status: SessionStatusEnum.Active,
      lastActivityTs: now,
      runningStartTs: now,
      expiresAt: now + item.sandboxTimeoutMs,
      createdTs: now
    });

    return {
      session,
      sdkCreateSessionResponse
    };
  }

  // Sandbox lifecycle

  async stopSandbox(item: {
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

  async pauseSandbox(item: {
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

  async resumeSandbox(item: {
    sessionId: string;
    sandboxType: SandboxTypeEnum;
    sandboxId: string;
    sandboxBaseUrl: string;
    sandboxAgentToken: string;
    nativeSessionId: string;
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
      sessionId: item.sessionId,
      nativeSessionId: item.nativeSessionId
    });
  }

  // Agent session management (SDK)

  async createAgentSession(item: {
    sessionId: string;
    sandboxBaseUrl: string;
    sandboxAgentToken: string;
    agent: string;
    agentMode?: string;
    permissionMode?: string;
  }): Promise<CreateSessionResponse> {
    let client: SandboxAgent = await this.sandboxService.connectClient({
      sessionId: item.sessionId,
      sandboxBaseUrl: item.sandboxBaseUrl,
      sandboxAgentToken: item.sandboxAgentToken
    });

    let request: CreateSessionRequest = {
      agent: item.agent,
      agentMode: item.agentMode,
      permissionMode: item.permissionMode
    };

    let response = await client
      .createSession(item.sessionId, request)
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_CONNECTION_FAILED,
          originalError: e
        });
      });

    return response;
  }

  // Agent communication (SDK)

  async sendMessage(item: {
    sessionId: string;
    nativeSessionId: string;
    message: string;
  }): Promise<void> {
    let client = this.sandboxService.getClient(item.sessionId);

    await client
      .postMessage(item.nativeSessionId, { message: item.message })
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_CONNECTION_FAILED,
          originalError: e
        });
      });
  }

  async respondToQuestion(item: {
    sessionId: string;
    nativeSessionId: string;
    questionId: string;
    answers: string[][];
  }): Promise<void> {
    let client = this.sandboxService.getClient(item.sessionId);

    await client
      .replyQuestion(item.nativeSessionId, item.questionId, {
        answers: item.answers
      })
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_CONNECTION_FAILED,
          originalError: e
        });
      });
  }

  async respondToPermission(item: {
    sessionId: string;
    nativeSessionId: string;
    permissionId: string;
    reply: PermissionReply;
  }): Promise<void> {
    let client = this.sandboxService.getClient(item.sessionId);

    await client
      .replyPermission(item.nativeSessionId, item.permissionId, {
        reply: item.reply
      })
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_CONNECTION_FAILED,
          originalError: e
        });
      });
  }

  // Scheduled task

  async pauseIdleSandboxes(): Promise<void> {
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

        await this.pauseSandbox({
          sessionId: session.sessionId,
          sandboxType: session.sandboxType as SandboxTypeEnum,
          sandboxId: session.sandboxId,
          e2bApiKey: project.e2bApiKey
        }).catch(() => {});
        await this.db.drizzle
          .update(sessionsTable)
          .set({
            status: SessionStatusEnum.Paused,
            serverTs: Date.now()
          })
          .where(eq(sessionsTable.sessionId, session.sessionId));
      }
    }
  }

  // stream

  startEventStream(item: {
    sessionId: string;
    nativeSessionId: string;
    offset?: number;
  }): void {
    this.stopEventStream(item.sessionId);

    let abortController = new AbortController();
    this.activeStreams.set(item.sessionId, abortController);

    this.runEventStreamLoop({
      sessionId: item.sessionId,
      nativeSessionId: item.nativeSessionId,
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
    nativeSessionId: string;
    offset: number;
    signal: AbortSignal;
  }): Promise<void> {
    let client = this.sandboxService.getClient(item.sessionId);
    let currentOffset = item.offset;

    let stream = client.streamEvents(
      item.nativeSessionId,
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

    await this.agentPubSubService
      .publish(item.sessionId, {
        eventId: item.event.event_id,
        sequence: item.event.sequence,
        type: item.event.type,
        eventData: item.event.data
      })
      .catch(() => {});
  }
}
