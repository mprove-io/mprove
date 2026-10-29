import { Result } from '@praha/byethrow';
import { and, desc, eq, notInArray } from 'drizzle-orm';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import { tabsToSessionApis } from '#backend/functions/db/sessions/tabs-to-session-apis/tabs-to-session-apis';
import type { DbService } from '#backend/services/db/db.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetBasicSessionsListError } from '#common/types/backend/function-errors/get-basic-sessions-list-error';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';

export type GetBasicSessionsListOutput = {
  sessions: SessionApi[];
  hasMoreArchived: boolean;
};

export async function getBasicSessionsList(item: {
  projectId: string;
  userId: string;
  currentSessionId?: string;
  db: DbService;
}): Result.ResultAsync<GetBasicSessionsListOutput, GetBasicSessionsListError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('sessions', v =>
      v.db.sessions.findMany({
        where: and(
          eq(sessionsTable.projectId, v.projectId),
          eq(sessionsTable.userId, v.userId),
          notInArray(sessionsTable.status, ['Deleted', 'Archived'])
        ),
        orderBy: [desc(sessionsTable.createdTs)]
      })
    ),
    Result.bind('currentSession', async v => {
      let isCurrentSessionIncluded: boolean = v.sessions.some(
        session => session.sessionId === v.currentSessionId
      );

      return v.currentSessionId && isCurrentSessionIncluded === false
        ? v.db.sessions.findFirst({
            where: and(
              eq(sessionsTable.sessionId, v.currentSessionId),
              eq(sessionsTable.projectId, v.projectId),
              eq(sessionsTable.userId, v.userId)
            )
          })
        : Result.succeed(undefined);
    }),
    Result.bind('hasMoreArchived', v =>
      v.db.sessions.isExist({
        where: and(
          eq(sessionsTable.projectId, v.projectId),
          eq(sessionsTable.userId, v.userId),
          eq(sessionsTable.status, 'Archived')
        )
      })
    ),
    Result.bind('apiSessions', v =>
      tabsToSessionApis({
        sessions: isUndefined(v.currentSession)
          ? [...v.sessions]
          : [...v.sessions, v.currentSession],
        db: v.db
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
