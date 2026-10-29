import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type { SessionTab } from '#backend/drizzle/postgres/tables/sessions';
import { archiveSessionWhileLocked } from '#backend/functions/session-archive/archive-session/archive-session-while-locked/archive-session-while-locked';
import type { DbService } from '#backend/services/db/db.service';
import type { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import type { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import type { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AcquireSessionLockError } from '#common/types/backend/function-errors/acquire-session-lock-error';
import type { ArchiveSessionError } from '#common/types/backend/function-errors/archive-session-error';
import type { ArchiveSessionWhileLockedError } from '#common/types/backend/function-errors/archive-session-while-locked-error';
import type { ArchiveReason } from '#common/types/backend/parts/session/archive-reason';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';

export async function archiveSession(item: {
  session: SessionTab;
  archiveReason: ArchiveReason;
  e2bApiKey: string;
  editorSessionLockService: EditorSessionLockService;
  db: DbService;
  editorSandboxService: EditorSandboxService;
  editorStreamService: EditorStreamService;
  logger: Logger;
  cs: ConfigService<BackendConfig>;
}): Result.ResultAsync<SessionApi, ArchiveSessionError> {
  let {
    session,
    editorSessionLockService,
    db,
    editorSandboxService,
    editorStreamService,
    logger,
    cs
  } = item;

  let sessionLockToken: string;

  // TODO: check session type is editor
  if (session.type === 'Editor') {
    let lockResult: Result.Result<string, AcquireSessionLockError> =
      await editorSessionLockService.acquireSessionLock({
        sessionId: session.sessionId
      });

    if (Result.isFailure(lockResult)) {
      return lockResult;
    }

    sessionLockToken = lockResult.value;
  }

  try {
    let result: Result.Result<SessionApi, ArchiveSessionWhileLockedError> =
      await archiveSessionWhileLocked({
        session: item.session,
        archiveReason: item.archiveReason,
        e2bApiKey: item.e2bApiKey,
        db: db,
        editorSandboxService: editorSandboxService,
        editorStreamService: editorStreamService,
        logger: logger,
        cs: cs
      });

    return result;
  } finally {
    if (isDefined(sessionLockToken)) {
      await editorSessionLockService.releaseSessionLock({
        sessionId: session.sessionId,
        token: sessionLockToken
      });
    }
  }
}
