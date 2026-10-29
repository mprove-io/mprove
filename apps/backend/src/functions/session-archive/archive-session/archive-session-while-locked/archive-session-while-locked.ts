import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { SessionTab } from '#backend/drizzle/postgres/tables/sessions';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import { tabToSessionApi } from '#backend/functions/db/sessions/tab-to-session-api/tab-to-session-api';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import type { DbService } from '#backend/services/db/db.service';
import type { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import type { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import type { ArchiveSessionWhileLockedError } from '#common/types/backend/function-errors/archive-session-while-locked-error';
import type { ArchiveReason } from '#common/types/backend/parts/session/archive-reason';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';

export async function archiveSessionWhileLocked(item: {
  session: SessionTab;
  archiveReason: ArchiveReason;
  e2bApiKey: string;
  db: DbService;
  editorSandboxService: EditorSandboxService;
  editorStreamService: EditorStreamService;
  logger: Logger;
  cs: ConfigService<BackendConfig>;
}): Result.ResultAsync<SessionApi, ArchiveSessionWhileLockedError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('freshSession', async v =>
      v.session.type === 'Editor'
        ? v.db.sessions.findFirstCheckExists({
            where: eq(sessionsTable.sessionId, v.session.sessionId)
          })
        : Result.succeed(v.session)
    ),
    Result.andThrough(v => {
      let isActiveOrPaused: boolean = (
        ['Active', 'Paused'] satisfies SessionStatus[]
      ).some(status => status === v.freshSession.status);

      return v.freshSession.type === 'Editor' && isActiveOrPaused
        ? v.editorSandboxService.stopSandbox({
            sandboxType: v.freshSession.sandboxType,
            sandboxId: v.freshSession.sandboxId,
            e2bApiKey: v.e2bApiKey
          })
        : Result.succeed();
    }),
    Result.bind('updatedSession', v => {
      let updatedSession: SessionTab = {
        ...v.freshSession,
        status: 'Archived',
        archiveReason: v.archiveReason
      };

      return Result.succeed(updatedSession);
    }),
    Result.andThrough(v =>
      v.db.write({
        insertOrUpdate: {
          sessions: [v.updatedSession]
        }
      })
    ),
    Result.andThrough(v => {
      setTimeout(() => {
        if (v.freshSession.type === 'Editor') {
          void v.editorStreamService
            .publishStopSessionStream({
              sessionId: v.freshSession.sessionId
            })
            .catch(e => {
              logToConsoleBackend({
                log: e,
                logLevel: 'Error',
                logger: v.logger,
                cs: v.cs
              });
            });
        }
      }, 10000);

      return Result.succeed();
    }),
    Result.map(
      (v): SessionApi =>
        tabToSessionApi({
          session: v.updatedSession
        })
    )
  );
}
