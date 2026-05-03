import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Event } from '@opencode-ai/sdk/v2';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateExplorerSessionRequestDto,
  ToBackendCreateExplorerSessionResponseDto
} from '#backend/controllers/sessions/create-explorer-session/create-explorer-session.dto';
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
import { CodexService } from '#backend/services/codex.service';
import { MembersService } from '#backend/services/db/members.service';
import { OcEventsService } from '#backend/services/db/oc-events.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { makeSessionId } from '#common/functions/make-session-id';
import { splitModel } from '#common/functions/split-model';
import { ServerError } from '#common/models/server-error';
import type { ToBackendCreateExplorerSessionResponsePayload } from '#common/zod/to-backend/sessions/to-backend-create-explorer-session';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateExplorerSessionController {
  constructor(
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private membersService: MembersService,
    private ocEventsService: OcEventsService,
    private codexService: CodexService,
    private explorerStreamService: ExplorerStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateExplorerSession)
  @ApiOperation({
    summary: 'CreateExplorerSession',
    description: 'Create a new explorer session'
  })
  @ApiOkResponse({
    type: ToBackendCreateExplorerSessionResponseDto
  })
  async createExplorerSession(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateExplorerSessionRequestDto
  ) {
    let {
      projectId,
      repoId,
      provider,
      model,
      variant,
      branchId,
      envId,
      firstMessage,
      messageId,
      partId,
      useCodex
    } = body.payload;

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

    if (useCodex && isUndefined(user.codexAuth)) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET
      });
    }

    // Prewarm codex auth so first message (title + stream parallel) starts with fresh token
    if (useCodex) {
      await this.codexService.prewarmCodexAuth({
        userId: user.userId
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
          repoId: repoId,
          branchId: branchId,
          userId: user.userId,
          projectId: projectId,
          sandboxType: undefined,
          provider: provider,
          model: model,
          lastMessageProviderModel: model,
          lastMessageVariant: variant,
          agent: undefined,
          firstMessage: firstMessage,
          initialBranch: undefined,
          envId: envId,
          initialCommit: undefined,
          useCodex: useCodex,
          status: SessionStatusEnum.Active,
          lastActivityTs: now,
          codexAuthUpdateTs: useCodex ? user.codexAuthUpdateTs : undefined,
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
          isLockAcquired: false,
          useCodex: useCodex,
          userId: useCodex ? user.userId : undefined
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
