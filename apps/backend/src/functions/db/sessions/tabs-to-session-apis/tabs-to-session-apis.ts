import { Result } from '@praha/byethrow';
import { inArray } from 'drizzle-orm';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { tabToSessionApi } from '#backend/functions/db/sessions/tab-to-session-api/tab-to-session-api';
import type { DbService } from '#backend/services/db/db.service';
import type { TabsToSessionApisError } from '#common/types/backend/function-errors/tabs-to-session-apis-error';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';

export async function tabsToSessionApis(item: {
  sessions: SessionTab[];
  db: DbService;
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
    Result.succeed({ sessions: sessions, sessionIds: sessionIds, db: item.db }),
    Result.bind('ocSessions', async v =>
      v.sessionIds.length > 0
        ? v.db.ocSessions.findMany({
            where: inArray(ocSessionsTable.sessionId, v.sessionIds)
          })
        : Result.succeed([])
    ),
    Result.map((v): SessionApi[] =>
      v.sessions.map(session =>
        tabToSessionApi({
          session: session,
          ocSession: v.ocSessions.find(
            ocSession => ocSession.sessionId === session.sessionId
          )
        })
      )
    )
  );
}
