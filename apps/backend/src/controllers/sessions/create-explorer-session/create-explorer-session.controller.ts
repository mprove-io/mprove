import crypto from 'node:crypto';
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
import type { EventSessionStatus, SessionStatus } from '@opencode-ai/sdk/v2';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
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
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { OcEventsService } from '#backend/services/db/oc-events.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeSessionId } from '#common/functions/make-session-id';
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
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private ocEventsService: OcEventsService,
    private providersService: ProvidersService,
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
      providerId,
      modelId,
      variant,
      branchId,
      envId,
      firstMessage,
      messageId,
      partId
    } = body.payload;

    await this.projectsService.getProjectCheckExists({
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

    await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId,
      allowProdRepo: true
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let modelSelection = await this.providersService.getModelSelection({
      projectId: projectId,
      providerId: providerId,
      modelId: modelId,
      variant: variant,
      isUserCodexAuthSet: isDefined(user.codexAuth),
      isBuilder: false
    });

    let isCodex = modelSelection.provider.type === ProviderTypeEnum.OpenAICodex;

    // Prewarm codex auth so first message (title + stream parallel) starts with fresh token
    if (isCodex) {
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
          providerId: providerId,
          modelId: modelId,
          lastMessageVariant: variant,
          agent: undefined,
          firstMessage: firstMessage,
          initialBranch: undefined,
          envId: envId,
          initialCommit: undefined,
          status: SessionStatusEnum.Active,
          lastActivityTs: now,
          codexAuthUpdateTs: isCodex ? user.codexAuthUpdateTs : undefined,
          createdTs: now
        });

        let ocSession = this.sessionsService.makeOcSession({
          sessionId: sessionId
        });

        if (firstMessage) {
          let busyEvent: EventSessionStatus = {
            id: crypto.randomUUID(),
            type: 'session.status',
            properties: {
              sessionID: sessionId,
              status: { type: 'busy' }
            }
          };

          let busyStatus: SessionStatus = { type: 'busy' };

          ocSession = {
            ...ocSession,
            ocSessionStatus: busyStatus
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
      this.explorerStreamService
        .streamMessage({
          sessionId: session.sessionId,
          provider: providerId,
          modelId: modelId,
          variant: variant,
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
