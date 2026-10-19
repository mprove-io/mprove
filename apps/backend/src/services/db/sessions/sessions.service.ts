import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, desc, eq, inArray, notInArray } from 'drizzle-orm';
import type {
  OcSessionTab,
  SessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { DbService } from '#backend/services/db/db.service';
import { PROD_REPO_ID } from '#common/constants/top';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CheckRepoIdError } from '#common/types/backend/function-errors/check-repo-id-error';
import type { GetBasicSessionsListError } from '#common/types/backend/function-errors/get-basic-sessions-list-error';
import type { OcSessionEntToTabError } from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';
import type { SessionEntToTabError } from '#common/types/backend/function-errors/session-ent-to-tab-error';
import type { TabsToSessionApisError } from '#common/types/backend/function-errors/tabs-to-session-apis-error';
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
  constructor(private db: DbService) {}

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

    let isSessionExist: boolean = await this.db.sessions.isExistUnwrap({
      where: and(
        eq(sessionsTable.sessionId, repoId),
        eq(sessionsTable.repoId, repoId),
        eq(sessionsTable.userId, userId),
        eq(sessionsTable.projectId, projectId)
      )
    });

    if (isSessionExist) {
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

  async getBasicSessionsList(item: {
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
        'sessions',
        (v): Result.ResultAsync<SessionTab[], SessionEntToTabError> =>
          this.db.sessions.findMany({
            where: and(
              eq(sessionsTable.projectId, v.projectId),
              eq(sessionsTable.userId, v.userId),
              notInArray(sessionsTable.status, ['Deleted', 'Archived'])
            ),
            orderBy: [desc(sessionsTable.createdTs)]
          })
      ),
      Result.bind(
        'currentSession',
        async (v): Result.ResultAsync<SessionTab, SessionEntToTabError> => {
          let isCurrentSessionIncluded: boolean = v.sessions.some(
            session => session.sessionId === v.currentSessionId
          );

          return v.currentSessionId && isCurrentSessionIncluded === false
            ? this.db.sessions.findFirst({
                where: and(
                  eq(sessionsTable.sessionId, v.currentSessionId),
                  eq(sessionsTable.projectId, v.projectId),
                  eq(sessionsTable.userId, v.userId)
                )
              })
            : Result.succeed(undefined);
        }
      ),
      Result.bind(
        'hasMoreArchived',
        (v): Result.ResultAsync<boolean, never> =>
          this.db.sessions.isExist({
            where: and(
              eq(sessionsTable.projectId, v.projectId),
              eq(sessionsTable.userId, v.userId),
              eq(sessionsTable.status, 'Archived')
            )
          })
      ),
      Result.bind(
        'apiSessions',
        (v): Result.ResultAsync<SessionApi[], TabsToSessionApisError> =>
          this.tabsToSessionApis({
            sessions: isUndefined(v.currentSession)
              ? [...v.sessions]
              : [...v.sessions, v.currentSession]
          })
      ),
      Result.map(
        (v): GetBasicSessionsListOutput => ({
          sessions: v.apiSessions,
          hasMoreArchived: v.hasMoreArchived
        })
      )
    );
  }

  async tabsToSessionApis(item: {
    sessions: SessionTab[];
  }): Result.ResultAsync<SessionApi[], TabsToSessionApisError> {
    let { sessions } = item;

    let statusOrder: Partial<Record<SessionStatus, number>> = {
      ['New']: 0,
      ['Active']: 1,
      ['Error']: 2,
      ['Paused']: 3,
      ['Archived']: 4
    };

    sessions.sort((a, b) => {
      let statusDiff: number =
        (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);

      if (statusDiff !== 0) return statusDiff;

      return b.createdTs - a.createdTs;
    });

    let sessionIds: string[] = sessions.map(session => session.sessionId);

    return Result.pipe(
      Result.succeed({ sessions: sessions, sessionIds: sessionIds }),
      Result.bind(
        'ocSessions',
        async (
          v
        ): Result.ResultAsync<OcSessionTab[], OcSessionEntToTabError> =>
          v.sessionIds.length > 0
            ? this.db.ocSessions.findMany({
                where: inArray(ocSessionsTable.sessionId, v.sessionIds)
              })
            : Result.succeed([])
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
