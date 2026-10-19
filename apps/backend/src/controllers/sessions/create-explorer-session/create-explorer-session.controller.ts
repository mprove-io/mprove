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
  ToBackendCreateExplorerSessionRequestDto,
  ToBackendCreateExplorerSessionResponseDto
} from '#backend/controllers/sessions/create-explorer-session/create-explorer-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  BranchTab,
  MemberTab,
  OcEventTab,
  OcSessionTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeSessionId } from '#backend/functions/make-session-id/make-session-id';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex/codex.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { OcEventsService } from '#backend/services/db/oc-events/oc-events.service';
import type { GetModelSelectionOutput } from '#backend/services/db/providers/providers.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetBranchCheckExistsError } from '#common/types/backend/function-errors/get-branch-check-exists-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetModelSelectionError } from '#common/types/backend/function-errors/get-model-selection-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateExplorerSessionOutput } from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateExplorerSessionController {
  constructor(
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private ocEventsService: OcEventsService,
    private providersService: ProvidersService,
    private codexService: CodexService,
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
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
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
        this.sessionsService.checkRepoId({
          repoId: v.repoId,
          userId: v.user.userId,
          projectId: v.projectId,
          allowProdRepo: true
        })
      ),
      Result.bind(
        'branch',
        (v): Result.ResultAsync<BranchTab, GetBranchCheckExistsError> =>
          this.db.branches.findFirstCheckExists({
            where: and(
              eq(branchesTable.projectId, v.projectId),
              eq(branchesTable.repoId, v.repoId),
              eq(branchesTable.branchId, v.branchId)
            )
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccess({
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
      Result.bind(
        'modelSelection',
        (
          v
        ): Result.ResultAsync<
          GetModelSelectionOutput,
          GetModelSelectionError
        > =>
          this.providersService.getModelSelection({
            projectId: v.projectId,
            providerId: v.providerId,
            modelId: v.modelId,
            variant: v.variant,
            isUserCodexAuthSet: isDefined(v.user.codexAuth),
            isBuilder: false
          })
      ),
      // Prewarm codex auth so first message (title + stream parallel) starts with fresh token
      Result.andThrough(async v =>
        v.modelSelection.provider.type === 'OpenAICodex'
          ? this.codexService.prewarmCodexAuth({ userId: v.user.userId })
          : Result.succeed()
      ),
      Result.bind(
        'session',
        async (v): Result.ResultAsync<SessionTab, DbErrorToError> => {
          let now: number = Date.now();

          let session: SessionTab;

          let persistenceResult: Result.Result<void, DbErrorToError> =
            await dbErrorToResult({
              action: async () => {
                await retry(
                  async () => {
                    let sessionId: string = makeSessionId();

                    session = this.sessionsService.makeSession({
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

                    let ocSession: OcSessionTab =
                      this.sessionsService.makeOcSession({
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

                      let busyEventTab: OcEventTab =
                        this.ocEventsService.makeOcEvent({
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
        }
      ),
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
