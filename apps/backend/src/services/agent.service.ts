import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  PermissionReply,
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
import { ErEnum } from '#common/enums/er.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ServerError } from '#common/models/server-error';
import { SessionsService } from './db/sessions.service';
import { SandboxService } from './sandbox.service';

export interface CreateSessionResult {
  sessionTab: SessionTab;
  createSessionResponse: CreateSessionResponse;
}

@Injectable()
export class AgentService {
  private activeStreams = new Map<string, AbortController>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService,
    private sandboxService: SandboxService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  // Session creation (combines sandbox + agent session)

  async createSession(item: {
    sandboxType: SandboxTypeEnum;
    timeoutMs: number;
    userId: string;
    projectId: string;
    agent: string;
    agentMode?: string;
    permissionMode?: string;
  }): Promise<CreateSessionResult> {
    let sandboxInfo = await this.sandboxService.createSandbox({
      sandboxType: item.sandboxType,
      timeoutMs: item.timeoutMs
    });

    let sessionId = uuidv4();
    let agentSessionId = uuidv4();

    let createSessionResponse = await this.createAgentSession({
      sessionId: sessionId,
      providerHost: sandboxInfo.providerHost,
      agentSessionId: agentSessionId,
      agent: item.agent,
      agentMode: item.agentMode,
      permissionMode: item.permissionMode
    });

    let now = Date.now();

    let sessionTab = this.sessionsService.makeSession({
      sessionId: sessionId,
      userId: item.userId,
      projectId: item.projectId,
      sandboxType: item.sandboxType,
      agent: item.agent,
      agentMode: item.agentMode,
      permissionMode: item.permissionMode,
      providerSandboxId: sandboxInfo.providerSandboxId,
      providerHost: sandboxInfo.providerHost,
      agentSessionId: agentSessionId,
      createSessionResponse: createSessionResponse,
      status: SessionStatusEnum.Active,
      lastActivityTs: now,
      runningStartTs: now,
      expiresAt: now + item.timeoutMs,
      createdTs: now
    });

    return {
      sessionTab,
      createSessionResponse
    };
  }

  // Sandbox lifecycle

  async stopSandbox(item: {
    sessionId: string;
    sandboxType: SandboxTypeEnum;
    providerSandboxId: string;
  }): Promise<void> {
    this.stopEventStream(item.sessionId);
    await this.sandboxService.disposeClient(item.sessionId);

    await this.sandboxService.stopProviderSandbox({
      sandboxType: item.sandboxType,
      providerSandboxId: item.providerSandboxId
    });
  }

  async pauseSandbox(item: {
    sessionId: string;
    sandboxType: SandboxTypeEnum;
    providerSandboxId: string;
  }): Promise<void> {
    this.stopEventStream(item.sessionId);
    await this.sandboxService.disposeClient(item.sessionId);

    await this.sandboxService.pauseProviderSandbox({
      sandboxType: item.sandboxType,
      providerSandboxId: item.providerSandboxId
    });
  }

  async resumeSandbox(item: {
    sessionId: string;
    sandboxType: SandboxTypeEnum;
    providerSandboxId: string;
    providerHost: string;
    nativeSessionId: string;
    timeoutMs: number;
  }): Promise<void> {
    await this.sandboxService.resumeProviderSandbox({
      sandboxType: item.sandboxType,
      providerSandboxId: item.providerSandboxId,
      timeoutMs: item.timeoutMs
    });

    await this.sandboxService.connectClient({
      sessionId: item.sessionId,
      providerHost: item.providerHost
    });

    this.startEventStream({
      sessionId: item.sessionId,
      nativeSessionId: item.nativeSessionId
    });
  }

  // Agent session management (SDK)

  async createAgentSession(item: {
    sessionId: string;
    providerHost: string;
    agentSessionId: string;
    agent: string;
    agentMode?: string;
    permissionMode?: string;
  }): Promise<CreateSessionResponse> {
    let client = await this.sandboxService.connectClient({
      sessionId: item.sessionId,
      providerHost: item.providerHost
    });

    let request: CreateSessionRequest = {
      agent: item.agent,
      agentMode: item.agentMode,
      permissionMode: item.permissionMode
    };

    let response = await client
      .createSession(item.agentSessionId, request)
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
    // let idleMinutes =
    //   this.cs.get<BackendConfig['sandboxIdleMinutes']>('sandboxIdleMinutes');
    // let idleThresholdTs = Date.now() - idleMinutes * 60 * 1000;
    // let sessions = await this.sessionsService.getIdleActiveSessions({
    //   idleThresholdTs
    // });
    // for (let session of sessions) {
    //   if (
    //     session.lastActivityTs &&
    //     session.lastActivityTs < idleThresholdTs &&
    //     session.providerSandboxId
    //   ) {
    //     await this.pauseSandbox({
    //       sessionId: session.sessionId,
    //       sandboxType: session.sandboxType as SandboxTypeEnum,
    //       providerSandboxId: session.providerSandboxId
    //     }).catch(() => {});
    //     await this.db.drizzle
    //       .update(sessionsTable)
    //       .set({
    //         status: SessionStatusEnum.Paused,
    //         serverTs: Date.now()
    //       })
    //       .where(eq(sessionsTable.sessionId, session.sessionId));
    //   }
    // }
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
  }
}
