import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, desc, eq, inArray, notInArray } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcSessionTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { OcSessionEnt } from '#backend/drizzle/postgres/schema/oc-sessions';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import {
  type SessionEnt,
  sessionsTable
} from '#backend/drizzle/postgres/schema/sessions';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckRepoIdError } from '#common/types/backend/function-errors/check-repo-id-error';
import type { EntsToSessionApisError } from '#common/types/backend/function-errors/ents-to-session-apis-error';
import type { GetBasicSessionsListError } from '#common/types/backend/function-errors/get-basic-sessions-list-error';
import type { GetOcSessionBySessionIdError } from '#common/types/backend/function-errors/get-oc-session-by-session-id-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { OcSessionEntToTabError } from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';
import type { SessionEntToTabError } from '#common/types/backend/function-errors/session-ent-to-tab-error';
import type { OcSessionApi } from '#common/types/backend/parts/session/oc-session-api';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';
import type { SessionType } from '#common/types/backend/parts/session/session-type';
import type { RepoType } from '#common/types/disk/parts/repo/repo-type';

export type GetBasicSessionsListOutput = {
  sessions: SessionApi[];
  hasMoreArchived: boolean;
};

@Injectable()
export class SessionsService {
  constructor(
    @Inject(DRIZZLE) private db: Db,
    private tabService: TabService
  ) {}

  makeSession(item: {
    sessionId: string;
    type: SessionType;
    repoId: string;
    branchId: string;
    userId: string;
    projectId: string;
    sandboxType: SandboxType;
    providerId: string;
    modelId: string;
    lastMessageVariant?: string;
    agent: string;
    sandboxId?: string;
    sandboxBaseUrl?: string;
    opencodeSessionId?: string;
    opencodePassword?: string;
    firstMessage?: string;
    apiKeyPrefix?: string;
    apiKeySecretHash?: string;
    apiKeySalt?: string;
    providerConfigHash?: string;
    initialBranch?: string;
    envId?: string;
    initialCommit?: string;
    codexAuthUpdateTs: number;
    status: SessionStatus;
    lastActivityTs: number;
    sandboxStartTs?: number;
    sandboxEndTs?: number;
    sandboxInfo?: any;
    createdTs: number;
  }): SessionTab {
    let session: SessionTab = {
      sessionId: item.sessionId,
      type: item.type,
      repoId: item.repoId,
      branchId: item.branchId,
      userId: item.userId,
      projectId: item.projectId,
      sandboxType: item.sandboxType,
      providerId: item.providerId,
      modelId: item.modelId,
      lastMessageVariant: item.lastMessageVariant,
      agent: item.agent,
      sandboxId: item.sandboxId,
      sandboxBaseUrl: item.sandboxBaseUrl,
      opencodeSessionId: item.opencodeSessionId,
      opencodePassword: item.opencodePassword,
      firstMessage: item.firstMessage,
      apiKeyPrefix: item.apiKeyPrefix,
      apiKeySecretHash: item.apiKeySecretHash,
      apiKeySalt: item.apiKeySalt,
      providerConfigHash: item.providerConfigHash,
      closedExplorerTabIds: [],
      initialBranch: item.initialBranch,
      envId: item.envId,
      initialCommit: item.initialCommit,
      codexAuthUpdateTs: item.codexAuthUpdateTs,
      status: item.status,
      archiveReason: undefined,
      pauseReason: undefined,
      lastActivityTs: item.lastActivityTs,
      sandboxStartTs: item.sandboxStartTs,
      sandboxEndTs: item.sandboxEndTs,
      sandboxInfo: item.sandboxInfo,
      lastFetchEventIndex: undefined,
      reloadRequestedTs: undefined,
      createdTs: item.createdTs,
      serverTs: undefined,
      keyTag: undefined
    };

    return session;
  }

  makeOcSession(item: { sessionId: string }): OcSessionTab {
    let ocSession: OcSessionTab = {
      sessionId: item.sessionId,
      serverTs: undefined,
      keyTag: undefined
    };

    return ocSession;
  }

  async getSessionByIdCheckExists(item: {
    sessionId: string;
  }): Promise<SessionTab> {
    let result: Result.Result<SessionTab, GetSessionByIdCheckExistsError> =
      await this.getSessionByIdCheckExistsResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let session: SessionTab = result.value;

    return session;
  }

  async getSessionByIdCheckExistsResult(item: {
    sessionId: string;
  }): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsError> {
    let { sessionId } = item;

    return this.db.drizzle.query.sessionsTable
      .findFirst({
        where: eq(sessionsTable.sessionId, sessionId)
      })
      .then((x: SessionEnt) =>
        isUndefined(x)
          ? Result.fail({ code: 'BACKEND_SESSION_NOT_FOUND' })
          : this.tabService.sessionEntToTabResult({ sessionEnt: x })
      );
  }

  async getOcSessionBySessionId(item: {
    sessionId: string;
  }): Promise<OcSessionTab> {
    let { sessionId } = item;

    let result: Result.Result<OcSessionTab, GetOcSessionBySessionIdError> =
      await this.getOcSessionBySessionIdResult({ sessionId: sessionId });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let ocSession: OcSessionTab = result.value;

    return ocSession;
  }

  async getOcSessionBySessionIdResult(item: {
    sessionId: string;
  }): Result.ResultAsync<OcSessionTab, GetOcSessionBySessionIdError> {
    let { sessionId } = item;

    return this.db.drizzle.query.ocSessionsTable
      .findFirst({
        where: eq(ocSessionsTable.sessionId, sessionId)
      })
      .then((x: OcSessionEnt) =>
        isUndefined(x)
          ? Result.succeed(undefined)
          : this.tabService.ocSessionEntToTabResult({ ocSessionEnt: x })
      );
  }

  tabToSessionApi(item: {
    session: SessionTab;
    ocSession?: OcSessionTab;
  }): SessionApi {
    let { session, ocSession } = item;

    return {
      sessionId: session.sessionId,
      type: session.type,
      repoId: session.repoId,
      branchId: session.branchId,
      providerId: session.providerId,
      agent: session.agent,
      modelId: session.modelId,
      lastMessageVariant: session.lastMessageVariant,
      status: session.status,
      archiveReason: session.archiveReason,
      pauseReason: session.pauseReason,
      initialBranch: session.initialBranch,
      envId: session.envId,
      initialCommit: session.initialCommit,
      createdTs: session.createdTs,
      lastActivityTs: session.lastActivityTs,
      firstMessage: session.firstMessage,
      title: ocSession?.openSession?.title,
      opencodeSessionId: session.opencodeSessionId,
      closedExplorerTabIds: session.closedExplorerTabIds
    };
  }

  async checkRepoId(item: {
    repoId: string;
    userId: string;
    projectId: string;
    allowProdRepo: boolean;
  }): Promise<RepoType> {
    let result: Result.Result<RepoType, CheckRepoIdError> =
      await this.checkRepoIdResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let repoType: RepoType = result.value;

    return repoType;
  }

  async checkRepoIdResult(item: {
    repoId: string;
    userId: string;
    projectId: string;
    allowProdRepo: boolean;
  }): Result.ResultAsync<RepoType, CheckRepoIdError> {
    let { repoId, userId, projectId, allowProdRepo } = item;

    if (repoId === PROD_REPO_ID) {
      if (allowProdRepo === false) {
        return Result.fail({ code: 'BACKEND_PRODUCTION_REPO_NOT_ALLOWED' });
      }

      return Result.succeed('production');
    }

    if (repoId === userId) {
      return Result.succeed('dev');
    }

    let sessionEnt: SessionEnt =
      await this.db.drizzle.query.sessionsTable.findFirst({
        where: and(
          eq(sessionsTable.sessionId, repoId),
          eq(sessionsTable.repoId, repoId),
          eq(sessionsTable.userId, userId),
          eq(sessionsTable.projectId, projectId)
        )
      });

    if (sessionEnt) {
      return Result.succeed('session');
    }

    return Result.fail({ code: 'BACKEND_FORBIDDEN_REPO_ID' });
  }

  tabToOcSessionApi(item: { ocSession: OcSessionTab }): OcSessionApi {
    let { ocSession } = item;

    return {
      sessionId: ocSession.sessionId,
      todos: ocSession.todos,
      questions: ocSession.questions,
      permissions: ocSession.permissions,
      ocSessionStatus: ocSession.ocSessionStatus,
      lastSessionError: ocSession.lastSessionError,
      isLastErrorRecovered: ocSession.isLastErrorRecovered
    };
  }

  async getBasicSessionsListResult(item: {
    projectId: string;
    userId: string;
    currentSessionId?: string;
  }): Result.ResultAsync<
    GetBasicSessionsListOutput,
    GetBasicSessionsListError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'sessionEnts',
        (v): Result.ResultAsync<SessionEnt[], never> =>
          this.db.drizzle.query.sessionsTable
            .findMany({
              where: and(
                eq(sessionsTable.projectId, v.projectId),
                eq(sessionsTable.userId, v.userId),
                notInArray(sessionsTable.status, ['Deleted', 'Archived'])
              ),
              orderBy: [desc(sessionsTable.createdTs)]
            })
            .then(sessionEnts => Result.succeed(sessionEnts))
      ),
      Result.bind(
        'currentSessionEnt',
        async (v): Result.ResultAsync<SessionEnt, never> => {
          let isCurrentSessionIncluded: boolean = v.sessionEnts.some(
            sessionEnt => sessionEnt.sessionId === v.currentSessionId
          );

          return v.currentSessionId && isCurrentSessionIncluded === false
            ? this.db.drizzle.query.sessionsTable
                .findFirst({
                  where: and(
                    eq(sessionsTable.sessionId, v.currentSessionId),
                    eq(sessionsTable.projectId, v.projectId),
                    eq(sessionsTable.userId, v.userId)
                  )
                })
                .then(sessionEnt => Result.succeed(sessionEnt))
            : Result.succeed(undefined);
        }
      ),
      Result.bind(
        'hasMoreArchived',
        (v): Result.ResultAsync<boolean, never> =>
          this.db.drizzle.query.sessionsTable
            .findFirst({
              where: and(
                eq(sessionsTable.projectId, v.projectId),
                eq(sessionsTable.userId, v.userId),
                eq(sessionsTable.status, 'Archived')
              ),
              columns: { sessionId: true }
            })
            .then(sessionEnt => Result.succeed(!isUndefined(sessionEnt)))
      ),
      Result.bind(
        'sessions',
        (v): Result.ResultAsync<SessionApi[], EntsToSessionApisError> =>
          this.entsToSessionApisResult({
            allEnts: isUndefined(v.currentSessionEnt)
              ? [...v.sessionEnts]
              : [...v.sessionEnts, v.currentSessionEnt]
          })
      ),
      Result.map(
        (v): GetBasicSessionsListOutput => ({
          sessions: v.sessions,
          hasMoreArchived: v.hasMoreArchived
        })
      )
    );
  }

  async entsToSessionApisResult(item: {
    allEnts: SessionEnt[];
  }): Result.ResultAsync<SessionApi[], EntsToSessionApisError> {
    let { allEnts } = item;

    let statusOrder: Partial<Record<SessionStatus, number>> = {
      ['New']: 0,
      ['Active']: 1,
      ['Error']: 2,
      ['Paused']: 3,
      ['Archived']: 4
    };

    allEnts.sort((a, b) => {
      let statusDiff: number =
        (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);

      if (statusDiff !== 0) return statusDiff;

      return b.createdTs - a.createdTs;
    });

    let sessionIds: string[] = allEnts.map(sessionEnt => sessionEnt.sessionId);

    let ocSessionEnts: OcSessionEnt[] =
      sessionIds.length > 0
        ? await this.db.drizzle.query.ocSessionsTable.findMany({
            where: inArray(ocSessionsTable.sessionId, sessionIds)
          })
        : [];

    return Result.pipe(
      Result.succeed({ allEnts: allEnts, ocSessionEnts: ocSessionEnts }),
      Result.bind(
        'ocSessions',
        (v): Result.Result<OcSessionTab[], OcSessionEntToTabError> =>
          Result.sequence(v.ocSessionEnts, x =>
            this.tabService.ocSessionEntToTabResult({ ocSessionEnt: x })
          )
      ),
      Result.bind(
        'sessions',
        (v): Result.Result<SessionTab[], SessionEntToTabError> =>
          Result.sequence(v.allEnts, x =>
            this.tabService.sessionEntToTabResult({ sessionEnt: x })
          )
      ),
      Result.map((v): SessionApi[] =>
        v.sessions.map(session =>
          this.tabToSessionApi({
            session: session,
            ocSession: v.ocSessions.find(
              ocSession => ocSession.sessionId === session.sessionId
            )
          })
        )
      )
    );
  }
}
