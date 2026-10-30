import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EventMessagePartUpdated,
  EventMessageUpdated,
  EventPermissionAsked,
  EventPermissionReplied,
  EventQuestionAsked,
  EventQuestionRejected,
  EventQuestionReplied,
  EventSessionError,
  EventSessionStatus,
  EventSessionUpdated,
  EventTodoUpdated,
  PermissionRequest,
  QuestionRequest,
  Session
} from '@opencode-ai/sdk/v2';
import { Result } from '@praha/byethrow';
import { eq, max, sql } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { ocEventsTable } from '#backend/drizzle/postgres/tables/oc-events';
import type { OcMessageTab } from '#backend/drizzle/postgres/tables/oc-messages';
import type { OcPartTab } from '#backend/drizzle/postgres/tables/oc-parts';
import type { OcSessionTab } from '#backend/drizzle/postgres/tables/oc-sessions';
import { ocSessionsTable } from '#backend/drizzle/postgres/tables/oc-sessions';
import type { SessionTab } from '#backend/drizzle/postgres/tables/sessions';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import { makeOcEvent } from '#backend/functions/db/oc-events/make-oc-event/make-oc-event';
import { makeOcMessage } from '#backend/functions/db/oc-messages/make-oc-message/make-oc-message';
import { makeOcPart } from '#backend/functions/db/oc-parts/make-oc-part/make-oc-part';
import { makeOcSession } from '#backend/functions/db/oc-sessions/make-oc-session/make-oc-session';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { SESSION_TITLE_UPDATED_EVENT_TYPE } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { DbOcSessionsFindFirstError } from '#common/types/backend/function-errors/db/oc-sessions/db-oc-sessions-find-first-error';
import type { DbSessionsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-check-exists-error';
import type { DrainAllQueuesError } from '#common/types/backend/function-errors/drain-all-queues-error';
import type { DrainQueueError } from '#common/types/backend/function-errors/drain-queue-error';
import type {
  MproveSessionTitleUpdatedEvent,
  SessionStreamEvent
} from '#common/types/backend/parts/session/session-stream-event';

export type DrainQueueOutput = { needsSafePause: boolean };

@Injectable()
export class SessionDrainService {
  pendingEvents = new Map<
    string,
    { sessionId: string; event: SessionStreamEvent; eventIndex: number }[]
  >();

  eventCounters = new Map<string, number>();

  private doneCallbacks = new Map<string, () => void>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  cleanup(item: { sessionId: string }): void {
    let { sessionId } = item;
    this.pendingEvents.delete(sessionId);
    this.eventCounters.delete(sessionId);
  }

  markDoneProducing(item: { sessionId: string; callback: () => void }): void {
    let { sessionId, callback } = item;

    let queue = this.pendingEvents.get(sessionId);
    if (!queue || queue.length === 0) {
      this.cleanup({ sessionId: sessionId });
      callback();
      return;
    }
    this.doneCallbacks.set(sessionId, callback);
  }

  async initEventCounter(item: { sessionId: string }): Promise<void> {
    let { sessionId } = item;

    if (!this.eventCounters.has(sessionId)) {
      let maxEventIndexRow = await this.db.drizzle
        .select({ maxIndex: max(ocEventsTable.eventIndex) })
        .from(ocEventsTable)
        .where(eq(ocEventsTable.sessionId, sessionId));

      let eventIndex = isDefined(maxEventIndexRow[0]?.maxIndex)
        ? maxEventIndexRow[0].maxIndex + 1
        : 0;

      this.eventCounters.set(sessionId, eventIndex);
    }
  }

  enqueue(item: { sessionId: string; event: SessionStreamEvent }): void {
    let eventIndex = this.eventCounters.get(item.sessionId) ?? 0;
    let queue = this.pendingEvents.get(item.sessionId);
    if (!queue) {
      queue = [];
      this.pendingEvents.set(item.sessionId, queue);
    }
    queue.push({
      sessionId: item.sessionId,
      event: item.event,
      eventIndex: eventIndex
    });
    this.eventCounters.set(item.sessionId, eventIndex + 1);
  }

  async drainAllQueues(): Result.ResultAsync<string[], DrainAllQueuesError> {
    let safePauseSessionIds: string[] = [];

    let pendingSessionIds = [...this.pendingEvents.keys()];

    let drainQueues: Result.Result<void[], DrainQueueError> =
      await Result.sequence(pendingSessionIds, async sessionId => {
        let drainQueueOutput: Result.Result<DrainQueueOutput, DrainQueueError> =
          await this.drainQueue({ sessionId: sessionId });

        if (Result.isFailure(drainQueueOutput)) {
          return drainQueueOutput;
        }

        let result: DrainQueueOutput = drainQueueOutput.value;

        let doneCb = this.doneCallbacks.get(sessionId);
        if (doneCb) {
          let queue = this.pendingEvents.get(sessionId);
          if (!queue || queue.length === 0) {
            this.doneCallbacks.delete(sessionId);
            this.cleanup({ sessionId: sessionId });
            doneCb();
          }
        }

        if (result.needsSafePause) {
          safePauseSessionIds.push(sessionId);
        }

        return Result.succeed();
      });

    if (Result.isFailure(drainQueues)) {
      return drainQueues;
    }

    return Result.succeed(safePauseSessionIds);
  }

  async drainQueue(item: {
    sessionId: string;
  }): Result.ResultAsync<DrainQueueOutput, DrainQueueError> {
    let { sessionId } = item;
    let queue = this.pendingEvents.get(sessionId);
    if (!queue || queue.length === 0) {
      return Result.succeed({ needsSafePause: false });
    }

    let itemCount = queue.length;
    let items = queue.slice(0, itemCount);

    let eventTabs = items.map(item =>
      makeOcEvent({
        sessionId: item.sessionId,
        event: item.event,
        eventIndex: item.eventIndex
      })
    );

    let uniqueMessages: OcMessageTab[] = [];

    items
      .filter(i => i.event.type === 'message.updated')
      .forEach(item => {
        let props = (item.event as EventMessageUpdated).properties;
        let tab = makeOcMessage({
          messageId: props.info.id,
          sessionId: sessionId,
          role: props.info.role,
          ocMessage: props.info
        });
        let idx = uniqueMessages.findIndex(m => m.messageId === tab.messageId);
        if (idx >= 0) {
          uniqueMessages[idx] = tab;
        } else {
          uniqueMessages.push(tab);
        }
      });

    let messageTabs = uniqueMessages;

    let uniqueParts = new Map<string, OcPartTab>();
    items
      .filter(i => i.event.type === 'message.part.updated')
      .forEach(item => {
        let props = (item.event as EventMessagePartUpdated).properties;
        let tab = makeOcPart({
          partId: props.part.id as string,
          messageId: props.part.messageID as string,
          sessionId: sessionId,
          ocPart: props.part
        });
        uniqueParts.set(tab.partId, tab);
      });
    let partTabs = [...uniqueParts.values()];

    let ocSessionTabs: OcSessionTab[] = [];

    let sessionUpdatedItems = items.filter(
      item => item.event.type === 'session.updated'
    );
    let sessionTitleUpdatedItems = items.filter(
      item => item.event.type === SESSION_TITLE_UPDATED_EVENT_TYPE
    );
    let todoItems = items.filter(item => item.event.type === 'todo.updated');
    let questionAskedItems = items.filter(
      item => item.event.type === 'question.asked'
    );
    let questionResolvedItems = items.filter(
      item =>
        item.event.type === 'question.replied' ||
        item.event.type === 'question.rejected'
    );
    let permissionAskedItems = items.filter(
      item => item.event.type === 'permission.asked'
    );
    let permissionRepliedItems = items.filter(
      item => item.event.type === 'permission.replied'
    );
    let sessionStatusItems = items.filter(
      item => item.event.type === 'session.status'
    );
    let sessionErrorItems = items.filter(
      item => item.event.type === 'session.error'
    );

    if (
      sessionUpdatedItems.length > 0 ||
      sessionTitleUpdatedItems.length > 0 ||
      todoItems.length > 0 ||
      questionAskedItems.length > 0 ||
      questionResolvedItems.length > 0 ||
      permissionAskedItems.length > 0 ||
      permissionRepliedItems.length > 0 ||
      sessionStatusItems.length > 0 ||
      sessionErrorItems.length > 0
    ) {
      let ocSessionResult: Result.Result<
        OcSessionTab,
        DbOcSessionsFindFirstError
      > = await this.db.ocSessions.findFirst({
        where: eq(ocSessionsTable.sessionId, sessionId)
      });

      if (Result.isFailure(ocSessionResult)) {
        return ocSessionResult;
      }

      let ocSessionTab: OcSessionTab = ocSessionResult.value;

      if (!ocSessionTab) {
        ocSessionTab = makeOcSession({
          sessionId
        });
      }

      if (sessionUpdatedItems.length > 0) {
        let lastItem = sessionUpdatedItems[sessionUpdatedItems.length - 1];
        let ocSessionData = (lastItem.event as EventSessionUpdated).properties
          .info;
        ocSessionTabs.push({ ...ocSessionTab, openSession: ocSessionData });
      }

      if (sessionTitleUpdatedItems.length > 0) {
        let lastItem =
          sessionTitleUpdatedItems[sessionTitleUpdatedItems.length - 1];

        let titleEvent = lastItem.event as MproveSessionTitleUpdatedEvent;

        let existingIndex = ocSessionTabs.findIndex(
          tab => tab.sessionId === sessionId
        );

        let base =
          existingIndex >= 0 ? ocSessionTabs[existingIndex] : ocSessionTab;

        let openSession: Session = {
          ...base.openSession,
          title: titleEvent.properties.title
        } as Session;

        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...base,
            openSession: openSession
          };
        } else {
          ocSessionTabs.push({ ...base, openSession: openSession });
        }
      }

      if (todoItems.length > 0) {
        let lastTodoEvent = todoItems[todoItems.length - 1];
        let todos =
          (lastTodoEvent.event as EventTodoUpdated).properties.todos ?? [];
        let existingIndex = ocSessionTabs.findIndex(
          t => t.sessionId === sessionId
        );
        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...ocSessionTabs[existingIndex],
            todos
          };
        } else {
          ocSessionTabs.push({ ...ocSessionTab, todos });
        }
      }

      if (questionAskedItems.length > 0 || questionResolvedItems.length > 0) {
        let existingIndex = ocSessionTabs.findIndex(
          t => t.sessionId === sessionId
        );
        let base =
          existingIndex >= 0 ? ocSessionTabs[existingIndex] : ocSessionTab;
        let questions: QuestionRequest[] = base.questions
          ? [...base.questions]
          : [];

        questionAskedItems.forEach(item => {
          let q = (item.event as EventQuestionAsked).properties;
          let idx = questions.findIndex(x => x.id === q.id);
          if (idx >= 0) {
            questions[idx] = q;
          } else {
            questions.push(q);
          }
        });

        questionResolvedItems.forEach(item => {
          let props = (
            item.event as EventQuestionReplied | EventQuestionRejected
          ).properties;
          questions = questions.filter(x => x.id !== props.requestID);
        });

        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...ocSessionTabs[existingIndex],
            questions
          };
        } else {
          ocSessionTabs.push({ ...ocSessionTab, questions });
        }
      }

      if (
        permissionAskedItems.length > 0 ||
        permissionRepliedItems.length > 0
      ) {
        let existingIndex = ocSessionTabs.findIndex(
          t => t.sessionId === sessionId
        );
        let base =
          existingIndex >= 0 ? ocSessionTabs[existingIndex] : ocSessionTab;
        let permissions: PermissionRequest[] = base.permissions
          ? [...base.permissions]
          : [];

        permissionAskedItems.forEach(item => {
          let p = (item.event as EventPermissionAsked).properties;
          let idx = permissions.findIndex(x => x.id === p.id);
          if (idx >= 0) {
            permissions[idx] = p;
          } else {
            permissions.push(p);
          }
        });

        permissionRepliedItems.forEach(item => {
          let props = (item.event as EventPermissionReplied).properties;
          permissions = permissions.filter(x => x.id !== props.requestID);
        });

        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...ocSessionTabs[existingIndex],
            permissions
          };
        } else {
          ocSessionTabs.push({ ...ocSessionTab, permissions });
        }
      }

      if (sessionErrorItems.length > 0 || sessionStatusItems.length > 0) {
        let existingIndex = ocSessionTabs.findIndex(
          t => t.sessionId === sessionId
        );
        let base =
          existingIndex >= 0 ? ocSessionTabs[existingIndex] : ocSessionTab;

        let lastSessionError = base.lastSessionError;
        let isLastErrorRecovered = base.isLastErrorRecovered;
        let ocSessionStatus = base.ocSessionStatus;

        if (sessionErrorItems.length > 0) {
          let lastErrorItem = sessionErrorItems[sessionErrorItems.length - 1];
          let errorProps = (lastErrorItem.event as EventSessionError)
            .properties;
          lastSessionError = errorProps.error as
            | Record<string, unknown>
            | undefined;
          isLastErrorRecovered = false;
        }

        if (sessionStatusItems.length > 0) {
          let lastStatusItem =
            sessionStatusItems[sessionStatusItems.length - 1];
          let statusProps = (lastStatusItem.event as EventSessionStatus)
            .properties;
          ocSessionStatus = statusProps.status;

          if (statusProps.status.type === 'busy' && lastSessionError) {
            isLastErrorRecovered = true;
          }
        }

        if (existingIndex >= 0) {
          ocSessionTabs[existingIndex] = {
            ...ocSessionTabs[existingIndex],
            ocSessionStatus,
            lastSessionError,
            isLastErrorRecovered
          };
        } else {
          ocSessionTabs.push({
            ...ocSessionTab,
            ocSessionStatus,
            lastSessionError,
            isLastErrorRecovered
          });
        }
      }
    }

    let hasActivityEvents =
      messageTabs.length > 0 ||
      partTabs.length > 0 ||
      todoItems.length > 0 ||
      questionAskedItems.length > 0 ||
      permissionAskedItems.length > 0;

    let persistence: Result.Result<void, DbErrorToError> =
      await dbErrorToResult({
        action: async () => {
          try {
            await this.db.drizzle.transaction(async tx => {
              await this.db.txWriteUnwrap({
                tx: tx,
                insert: {
                  ocEvents: eventTabs
                },
                insertOrUpdate: {
                  ocMessages: messageTabs,
                  ocParts: partTabs,
                  ocSessions: ocSessionTabs
                }
              });

              if (hasActivityEvents) {
                let now: number = Date.now();

                await tx.execute(
                  sql`UPDATE sessions SET last_activity_ts = ${now} WHERE session_id = ${sessionId}`
                );
              }
            });
          } catch (e) {
            let eventIds: string[] = eventTabs.map(t => t.eventId);

            let queueLength: number = queue.length;

            logToConsoleBackend({
              log: new ServerError({
                message: 'BACKEND_DRAIN_QUEUE_FAILED',
                customData: {
                  sessionId: sessionId,
                  eventCount: eventIds.length,
                  eventIds: eventIds,
                  queueLengthAfterFail: queueLength
                },
                originalError: e
              }),
              logLevel: 'Error',
              logger: this.logger,
              cs: this.cs
            });

            throw e;
          }
        }
      });

    if (Result.isFailure(persistence)) {
      return persistence;
    }

    queue.splice(0, itemCount);

    let needsSafePause = false;

    if (sessionStatusItems.length > 0) {
      let lastStatusItem = sessionStatusItems[sessionStatusItems.length - 1];
      let statusProps = (lastStatusItem.event as EventSessionStatus).properties;

      if (statusProps.status.type === 'idle') {
        let sessionPauseOnUserTurnMinutes = this.cs.get<
          BackendConfig['sessionPauseOnUserTurnMinutes']
        >('sessionPauseOnUserTurnMinutes');

        if (sessionPauseOnUserTurnMinutes) {
          let sessionResult: Result.Result<
            SessionTab,
            DbSessionsFindFirstCheckExistsError
          > = await this.db.sessions.findFirstCheckExists({
            where: eq(sessionsTable.sessionId, sessionId)
          });

          if (Result.isFailure(sessionResult)) {
            return sessionResult;
          }

          let session: SessionTab = sessionResult.value;

          if (
            session.sandboxStartTs &&
            Date.now() - sessionPauseOnUserTurnMinutes * 60 * 1000 >
              session.sandboxStartTs
          ) {
            needsSafePause = true;
          }
        }
      }
    }

    return Result.succeed({ needsSafePause: needsSafePause });
  }
}
