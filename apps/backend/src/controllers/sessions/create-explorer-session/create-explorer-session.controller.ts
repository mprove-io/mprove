import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Event } from '@opencode-ai/sdk/v2';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { MembersService } from '#backend/services/db/members.service.js';
import { OcEventsService } from '#backend/services/db/oc-events.service';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream.service';
import { PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeSessionId } from '#common/functions/make-session-id';
import { splitModel } from '#common/functions/split-model';
import {
  ToBackendCreateExplorerSessionRequest,
  ToBackendCreateExplorerSessionResponsePayload
} from '#common/interfaces/to-backend/sessions/to-backend-create-explorer-session';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateExplorerSessionController {
  constructor(
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private membersService: MembersService,
    private ocEventsService: OcEventsService,
    private explorerStreamService: ExplorerStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateExplorerSession)
  async createExplorerSession(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendCreateExplorerSessionRequest = request.body;
    let {
      projectId,
      provider,
      model,
      variant,
      initialBranch,
      envId,
      firstMessage,
      messageId,
      partId
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    if (userMember.isExplorer === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

    let now = Date.now();
    let session: SessionTab;

    await retry(
      async () => {
        let sessionId = makeSessionId();

        session = this.sessionsService.makeSession({
          sessionId: sessionId,
          type: SessionTypeEnum.Explorer,
          repoId: PROD_REPO_ID,
          branchId: initialBranch,
          userId: user.userId,
          projectId: projectId,
          sandboxType: undefined,
          provider: provider,
          model: model,
          lastMessageProviderModel: model,
          lastMessageVariant: variant,
          agent: undefined,
          firstMessage: firstMessage,
          initialBranch: initialBranch,
          envId: envId,
          initialCommit: undefined,
          useCodex: false,
          status: SessionStatusEnum.Active,
          lastActivityTs: now,
          codexAuthUpdateTs: undefined,
          createdTs: now
        });

        let ocSession = this.sessionsService.makeOcSession({
          sessionId: sessionId
        });

        if (firstMessage) {
          let busyEvent: Event = {
            type: 'session.status',
            properties: { status: { type: 'busy' } }
          } as Event;

          ocSession = {
            ...ocSession,
            ocSessionStatus: { type: 'busy' } as any
          };

          let busyEventTab = this.ocEventsService.makeOcEvent({
            sessionId: sessionId,
            event: busyEvent,
            eventIndex: 0
          });

          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insert: {
                  sessions: [session],
                  ocSessions: [ocSession],
                  ocEvents: [busyEventTab]
                }
              })
          );
        } else {
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insert: {
                  sessions: [session],
                  ocSessions: [ocSession]
                }
              })
          );
        }
      },
      getRetryOption(this.cs, this.logger)
    );

    // Fire-and-forget first message streaming
    if (firstMessage) {
      let split = splitModel(model);
      let modelProvider = split ? split.providerID : provider;
      let modelId = split ? split.modelID : model;

      let apiKey = '';
      if (modelProvider === 'openai') {
        apiKey = project.openaiApiKey || '';
      } else if (modelProvider === 'anthropic') {
        apiKey = project.anthropicApiKey || '';
      }

      this.explorerStreamService
        .streamMessage({
          sessionId: session.sessionId,
          provider: modelProvider,
          modelId: modelId,
          apiKey: apiKey,
          userMessage: firstMessage,
          messageId: messageId,
          partId: partId,
          isLockAcquired: false
        })
        .catch(e => {
          logToConsoleBackend({
            log: e,
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        });
    }

    let payload: ToBackendCreateExplorerSessionResponsePayload = {
      sessionId: session.sessionId,
      repoId: session.repoId,
      branchId: session.branchId,
      envId: session.envId
    };

    return payload;
  }
}
