import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { SessionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { SessionsService } from '#backend/services/db/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream.service';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import type { SessionApi } from '#common/zod/backend/session-api';

@Injectable()
export class SessionArchiveService {
  constructor(
    @Inject(DRIZZLE) private db: Db,
    private sessionsService: SessionsService,
    private editorSandboxService: EditorSandboxService,
    private editorStreamService: EditorStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async archiveSession(item: {
    session: SessionTab;
    archiveReason: ArchiveReasonEnum;
    e2bApiKey: string;
  }): Promise<SessionApi> {
    let { session, archiveReason, e2bApiKey } = item;

    // TODO: check session type is editor

    let isActiveOrPaused =
      [SessionStatusEnum.Active, SessionStatusEnum.Paused].indexOf(
        session.status
      ) > -1;

    if (session.type === SessionTypeEnum.Editor && isActiveOrPaused) {
      await this.editorSandboxService.stopSandbox({
        sandboxType: session.sandboxType as SandboxTypeEnum,
        sandboxId: session.sandboxId,
        e2bApiKey: e2bApiKey
      });
    }

    let updatedSession: SessionTab = {
      ...session,
      status: SessionStatusEnum.Archived,
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
      if (session.type === SessionTypeEnum.Editor) {
        this.editorStreamService
          .publishStopSessionStream({
            sessionId: session.sessionId
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
    }, 10_000);

    let sessionApi = this.sessionsService.tabToSessionApi({
      session: updatedSession
    });

    return sessionApi;
  }
}
