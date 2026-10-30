import crypto from 'node:crypto';
import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { EventSessionStatus, SessionStatus } from '@opencode-ai/sdk/v2';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCreateExplorerSessionRequestDto,
  ToBackendCreateExplorerSessionResponseDto
} from '#backend/controllers/sessions/create-explorer-session/create-explorer-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { OcEventTab } from '#backend/drizzle/postgres/tables/oc-events';
import type { OcSessionTab } from '#backend/drizzle/postgres/tables/oc-sessions';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { SessionTab } from '#backend/drizzle/postgres/tables/sessions';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkRepoId } from '#backend/functions/check-repo-id/check-repo-id';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { makeOcEvent } from '#backend/functions/db/oc-events/make-oc-event/make-oc-event';
import { makeOcSession } from '#backend/functions/db/oc-sessions/make-oc-session/make-oc-session';
import { getProviderModelSelection } from '#backend/functions/db/providers/get-provider-model-selection/get-provider-model-selection';
import { makeSession } from '#backend/functions/db/sessions/make-session/make-session';
import { makeSessionId } from '#backend/functions/db/sessions/make-session-id/make-session-id';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { prewarmCodexAuth } from '#backend/functions/llm-providers/codex/auth/prewarm-codex-auth/prewarm-codex-auth';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateExplorerSessionOutput } from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateExplorerSessionController {
  constructor(
    private explorerStreamService: ExplorerStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendCreateExplorerSession' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'createExplorerSession'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        repoId: body.input.repoId,
        providerId: body.input.providerId,
        modelId: body.input.modelId,
        variant: body.input.variant,
        branchId: body.input.branchId,
        envId: body.input.envId,
        firstMessage: body.input.firstMessage,
        messageId: body.input.messageId,
        partId: body.input.partId,
        user: user
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.andThrough(v =>
        v.userMember.isExplorer === false
          ? Result.fail({ code: 'BACKEND_MEMBER_IS_NOT_EXPLORER' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true,
          db: this.db
        })
      ),
      Result.bind('branch', v =>
        this.db.branches.findFirstCheckExists({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, v.repoId),
            eq(branchesTable.branchId, v.branchId)
          )
        })
      ),
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.andThrough(v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.branch.projectId),
            eq(bridgesTable.repoId, v.branch.repoId),
            eq(bridgesTable.branchId, v.branch.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('modelSelection', v =>
        getProviderModelSelection({
          projectId: v.projectId,
          providerId: v.providerId,
          modelId: v.modelId,
          variant: v.variant,
          isUserCodexAuthSet: isDefined(v.user.codexAuth),
          isBuilder: false,
          db: this.db
        })
      ),
      // Prewarm codex auth so first message (title + stream parallel) starts with fresh token
      Result.andThrough(async v =>
        v.modelSelection.provider.type === 'OpenAICodex'
          ? prewarmCodexAuth({
              userId: v.user.userId,
              db: this.db
            })
          : Result.succeed()
      ),
      Result.bind('session', async v => {
        let now: number = Date.now();

        let session: SessionTab;

        let persistenceResult: Result.Result<void, DbErrorToError> =
          await dbErrorToResult({
            action: async () => {
              await retry(
                async () => {
                  let sessionId: string = makeSessionId();

                  session = makeSession({
                    sessionId: sessionId,
                    type: 'Explorer',
                    repoId: v.repoId,
                    branchId: v.branchId,
                    userId: v.user.userId,
                    projectId: v.projectId,
                    sandboxType: undefined,
                    providerId: v.providerId,
                    modelId: v.modelId,
                    lastMessageVariant: v.variant,
                    agent: undefined,
                    firstMessage: v.firstMessage,
                    initialBranch: undefined,
                    envId: v.envId,
                    initialCommit: undefined,
                    status: 'Active',
                    lastActivityTs: now,
                    codexAuthUpdateTs:
                      v.modelSelection.provider.type === 'OpenAICodex'
                        ? v.user.codexAuthUpdateTs
                        : undefined,
                    createdTs: now
                  });

                  let ocSession: OcSessionTab = makeOcSession({
                    sessionId: sessionId
                  });

                  if (v.firstMessage) {
                    let busyEvent: EventSessionStatus = {
                      id: crypto.randomUUID(),
                      type: 'session.status',
                      properties: {
                        sessionID: sessionId,
                        status: { type: 'busy' }
                      }
                    };

                    let busyStatus: SessionStatus = { type: 'busy' };

                    ocSession = { ...ocSession, ocSessionStatus: busyStatus };

                    let busyEventTab: OcEventTab = makeOcEvent({
                      sessionId: sessionId,
                      event: busyEvent,
                      eventIndex: 0
                    });

                    await this.db.writeUnwrap({
                      insert: {
                        sessions: [session],
                        ocSessions: [ocSession],
                        ocEvents: [busyEventTab]
                      },
                      retryOptions: { retries: 0 }
                    });
                  } else {
                    await this.db.writeUnwrap({
                      insert: {
                        sessions: [session],
                        ocSessions: [ocSession]
                      },
                      retryOptions: { retries: 0 }
                    });
                  }
                },
                getRetryOption(this.cs, this.logger)
              );
            }
          });

        return Result.isFailure(persistenceResult)
          ? persistenceResult
          : Result.succeed(session);
      }),
      // Fire-and-forget first message streaming
      Result.andThrough(v => {
        if (v.firstMessage) {
          void this.explorerStreamService
            .streamMessage({
              sessionId: v.session.sessionId,
              provider: v.providerId,
              modelId: v.modelId,
              variant: v.variant,
              userMessage: v.firstMessage,
              messageId: v.messageId,
              partId: v.partId,
              isLockAcquired: false
            })
            .catch(e => {
              logToConsoleBackend({
                log: e,
                logLevel: 'Error',
                logger: this.logger,
                cs: this.cs
              });
            });
        }

        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendCreateExplorerSessionOutput => ({
          sessionId: v.session.sessionId,
          repoId: v.session.repoId,
          branchId: v.session.branchId,
          envId: v.session.envId
        })
      )
    );
  }
}
