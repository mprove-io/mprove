import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Result } from '@praha/byethrow';
import pIteration from 'p-iteration';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { NotesService } from '#backend/services/db/notes/notes.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { AcquireSessionLockError } from '#common/types/backend/function-errors/acquire-session-lock-error';
import type { GetEditorSessionsToPauseError } from '#common/types/backend/function-errors/get-editor-sessions-to-pause-error';
import type { PauseSessionByIdError } from '#common/types/backend/function-errors/pause-session-by-id-error';
import type { SyncAllEditorSessionsStatusError } from '#common/types/backend/function-errors/sync-all-editor-sessions-status-error';
import { WithTraceSpan } from '#node-common/decorators/with-trace-span.decorator';

const { forEachSeries } = pIteration;

@Injectable()
export class TasksService {
  private isRunningCheckQueries = false;
  private isRunningRemoveStructs = false;
  private isRunningRemoveQueries = false;
  private isRunningRemoveNotes = false;
  private isRunningSyncEditorSessionsStatus = false;
  private isRunningPauseIdleEditorSessions = false;

  constructor(
    private cs: ConfigService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private notesService: NotesService,
    private editorSandboxService: EditorSandboxService,
    private editorSessionLockService: EditorSessionLockService,
    private editorStreamService: EditorStreamService,
    private logger: Logger
  ) {}

  @Cron('*/3 * * * * *') // EVERY_3_SECONDS
  @WithTraceSpan()
  async loopCheckQueries() {
    if (this.isRunningCheckQueries === false) {
      this.isRunningCheckQueries = true;

      await this.queriesService
        .checkBigqueryRunningQueries()
        .then(result => {
          if (Result.isFailure(result)) {
            throw new ServerError({ message: result.error.code });
          }
        })
        .catch(e => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_SCHEDULER_CHECK_BIGQUERY_RUNNING_QUERIES',
              originalError: e
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });

      this.isRunningCheckQueries = false;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  @WithTraceSpan()
  async loopRemoveStructs() {
    if (this.isRunningRemoveStructs === false) {
      this.isRunningRemoveStructs = true;

      await this.structsService.removeStructs().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SCHEDULER_REMOVE_STRUCTS',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningRemoveStructs = false;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @WithTraceSpan()
  async loopRemoveQueries() {
    if (this.isRunningRemoveQueries === false) {
      this.isRunningRemoveQueries = true;

      await this.queriesService.removeQueries().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SCHEDULER_REMOVE_QUERIES',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningRemoveQueries = false;
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @WithTraceSpan()
  async loopRemoveNotes() {
    if (this.isRunningRemoveNotes === false) {
      this.isRunningRemoveNotes = true;

      await this.notesService.removeNotes().catch(e => {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SCHEDULER_REMOVE_NOTES',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      });

      this.isRunningRemoveNotes = false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  @WithTraceSpan()
  async loopPauseIdleEditorSessions() {
    if (this.isRunningPauseIdleEditorSessions === false) {
      this.isRunningPauseIdleEditorSessions = true;

      try {
        let sessionsToPause: Result.Result<
          string[],
          GetEditorSessionsToPauseError
        > = await this.editorSandboxService.getEditorSessionsToPause();

        if (Result.isFailure(sessionsToPause)) {
          throw new ServerError({ message: sessionsToPause.error.code });
        }

        let sessionIdsToPause: string[] = sessionsToPause.value;

        await forEachSeries(sessionIdsToPause, async sessionId => {
          try {
            let sessionLockResult: Result.Result<
              string,
              AcquireSessionLockError
            > = await this.editorSessionLockService.acquireSessionLock({
              sessionId: sessionId
            });

            if (Result.isFailure(sessionLockResult)) {
              throw new ServerError({ message: sessionLockResult.error.code });
            }

            let sessionLockToken: string = sessionLockResult.value;

            try {
              let freshSessionsToPause: Result.Result<
                string[],
                GetEditorSessionsToPauseError
              > = await this.editorSandboxService.getEditorSessionsToPause();

              if (Result.isFailure(freshSessionsToPause)) {
                throw new ServerError({
                  message: freshSessionsToPause.error.code
                });
              }

              let freshSessionIdsToPause: string[] = freshSessionsToPause.value;

              let shouldPause = freshSessionIdsToPause.includes(sessionId);

              if (shouldPause === false) {
                return;
              }

              await this.editorStreamService.publishStopSessionStream({
                sessionId: sessionId
              });

              let pauseSession: Result.Result<void, PauseSessionByIdError> =
                await this.editorSandboxService.pauseSessionById({
                  sessionId: sessionId,
                  pauseReason: 'Idle'
                });

              if (Result.isFailure(pauseSession)) {
                throw new ServerError({ message: pauseSession.error.code });
              }

              await this.editorStreamService.setSessionRequestedReloadTs({
                sessionId: sessionId
              });
            } finally {
              await this.editorSessionLockService.releaseSessionLock({
                sessionId: sessionId,
                token: sessionLockToken
              });
            }
          } catch (e) {
            logToConsoleBackend({
              log: new ServerError({
                message: 'BACKEND_SCHEDULER_PAUSE_IDLE_EDITOR_SESSION_FALIED',
                originalError: e
              }),
              logLevel: 'Error',
              logger: this.logger,
              cs: this.cs
            });
          }
        });
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SCHEDULER_PAUSE_IDLE_EDITOR_SESSIONS_FALIED',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      }

      this.isRunningPauseIdleEditorSessions = false;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  @WithTraceSpan()
  async loopSyncEditorSessionsStatus() {
    if (this.isRunningSyncEditorSessionsStatus === false) {
      this.isRunningSyncEditorSessionsStatus = true;

      try {
        let syncedSessions: Result.Result<
          string[],
          SyncAllEditorSessionsStatusError
        > = await this.editorSandboxService.syncAllEditorSessionsStatus();

        if (Result.isFailure(syncedSessions)) {
          throw new ServerError({ message: syncedSessions.error.code });
        }

        let pausedSessionIds: string[] = syncedSessions.value;

        await forEachSeries(pausedSessionIds, async sessionId => {
          await this.editorStreamService.setSessionRequestedReloadTs({
            sessionId: sessionId
          });
        });
      } catch (e) {
        logToConsoleBackend({
          log: new ServerError({
            message: 'BACKEND_SCHEDULER_SYNC_EDITOR_SESSIONS_STATUS_FAILED',
            originalError: e
          }),
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      }

      this.isRunningSyncEditorSessionsStatus = false;
    }
  }
}
