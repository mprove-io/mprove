import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ArchiveReason } from '#common/types/backend/parts/session/archive-reason';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';

@Injectable()
export class SessionArchiveService {
  constructor(
    @Inject(DRIZZLE) private db: Db,
    private sessionsService: SessionsService,
    private editorSandboxService: EditorSandboxService,
    private editorSessionLockService: EditorSessionLockService,
    private editorStreamService: EditorStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async archiveSession(item: {
    session: SessionTab;
    archiveReason: ArchiveReason;
    e2bApiKey: string;
  }): Promise<SessionApi> {
    let { session, archiveReason, e2bApiKey } = item;

    // TODO: check session type is editor

    let sessionLockToken =
      session.type === 'Editor'
        ? await this.editorSessionLockService.acquireSessionLock({
            sessionId: session.sessionId
          })
        : undefined;

    try {
      if (session.type === 'Editor') {
        session = await this.sessionsService.getSessionByIdCheckExists({
          sessionId: session.sessionId
        });
      }

      let isActiveOrPaused = (
        ['Active', 'Paused'] satisfies SessionStatus[]
      ).some(candidate => candidate === session.status);

      if (session.type === 'Editor' && isActiveOrPaused) {
        await this.editorSandboxService.stopSandbox({
          sandboxType: session.sandboxType as SandboxType,
          sandboxId: session.sandboxId,
          e2bApiKey: e2bApiKey
        });
      }

      let updatedSession: SessionTab = {
        ...session,
        status: 'Archived',
        archiveReason: archiveReason
      };

      await retry(
        async () =>
          await this.db.drizzle.transaction(async tx => {
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                sessions: [updatedSession]
              }
            });
          }),
        getRetryOption(this.cs, this.logger)
      );

      setTimeout(() => {
        if (session.type === 'Editor') {
          this.editorStreamService
            .publishStopSessionStream({
              sessionId: session.sessionId
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
      }, 10_000);

      let sessionApi = this.sessionsService.tabToSessionApi({
        session: updatedSession
      });

      return sessionApi;
    } finally {
      if (isDefined(sessionLockToken)) {
        await this.editorSessionLockService.releaseSessionLock({
          sessionId: session.sessionId,
          token: sessionLockToken
        });
      }
    }
  }
}
