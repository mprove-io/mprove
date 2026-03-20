import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  Event,
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
  QuestionRequest
} from '@opencode-ai/sdk/v2';
import { eq, max, sql } from 'drizzle-orm';
import pIteration from 'p-iteration';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcMessageTab,
  OcPartTab,
  OcSessionTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ServerError } from '#common/models/server-error';
import { OcEventsService } from '../db/oc-events.service';
import { OcMessagesService } from '../db/oc-messages.service';
import { OcPartsService } from '../db/oc-parts.service';
import { SessionsService } from '../db/sessions.service';

const { forEachSeries } = pIteration;

@Injectable()
export class AgentDrainService {
  pendingEvents = new Map<
    string,
    { sessionId: string; event: Event; eventIndex: number }[]
  >();

  eventCounters = new Map<string, number>();

  constructor(
    private cs: ConfigService<BackendConfig>,
    private sessionsService: SessionsService,
    private ocEventsService: OcEventsService,
    private ocMessagesService: OcMessagesService,
    private ocPartsService: OcPartsService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  cleanup(item: { sessionId: string }): void {
    let { sessionId } = item;
    this.pendingEvents.delete(sessionId);
    this.eventCounters.delete(sessionId);
  }

  async initEventCounter(item: { sessionId: string }): Promise<void> {
    let { sessionId } = item;

    if (!this.eventCounters.has(sessionId)) {
      let maxRow = await this.db.drizzle
        .select({ maxIndex: max(ocEventsTable.eventIndex) })
        .from(ocEventsTable)
        .where(eq(ocEventsTable.sessionId, sessionId));

      let eventIndex = maxRow[0]?.maxIndex != null ? maxRow[0].maxIndex + 1 : 0;

      this.eventCounters.set(sessionId, eventIndex);
    }
  }

  enqueue(item: { sessionId: string; event: Event }): void {
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

  async drainAllQueues(): Promise<string[]> {
    let safePauseSessionIds: string[] = [];

    let pendingSessionIds = [...this.pendingEvents.keys()];

    await forEachSeries(pendingSessionIds, async sessionId => {
      let result = await this.drainQueue({ sessionId: sessionId });
      if (result.needsSafePause) {
        safePauseSessionIds.push(sessionId);
      }
    });

    return safePauseSessionIds;
  }

  async drainQueue(item: {
    sessionId: string;
  }): Promise<{ needsSafePause: boolean }> {
    let { sessionId } = item;
    let queue = this.pendingEvents.get(sessionId);
    if (!queue || queue.length === 0) {
      return { needsSafePause: false };
    }

    let itemCount = queue.length;
    let items = queue.slice(0, itemCount);

    let eventTabs = items.map(item =>
      this.ocEventsService.makeOcEvent({
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
        let tab = this.ocMessagesService.makeOcMessage({
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
        let tab = this.ocPartsService.makeOcPart({
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
      todoItems.length > 0 ||
      questionAskedItems.length > 0 ||
      questionResolvedItems.length > 0 ||
      permissionAskedItems.length > 0 ||
      permissionRepliedItems.length > 0 ||
      sessionStatusItems.length > 0 ||
      sessionErrorItems.length > 0
    ) {
      let ocSessionTab = await this.sessionsService.getOcSessionBySessionId({
        sessionId: sessionId
      });

      if (!ocSessionTab) {
        ocSessionTab = this.sessionsService.makeOcSession({ sessionId });
      }

      if (sessionUpdatedItems.length > 0) {
        let lastItem = sessionUpdatedItems[sessionUpdatedItems.length - 1];
        let ocSessionData = (lastItem.event as EventSessionUpdated).properties
          .info;
        ocSessionTabs.push({ ...ocSessionTab, openSession: ocSessionData });
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

          if (statusProps.status.type === 'idle' && lastSessionError) {
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

    try {
      await this.db.drizzle.transaction(async tx => {
        await this.db.packer.write({
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
          let now = Date.now();

          await tx.execute(
            sql`UPDATE sessions SET last_activity_ts = ${now} WHERE session_id = ${sessionId}`
          );
        }
      });
    } catch (e) {
      let eventIds = eventTabs.map(t => t.eventId);
      let queueLength = queue.length;
      logToConsoleBackend({
        log: new ServerError({
          message: ErEnum.BACKEND_AGENT_DRAIN_QUEUE_FAILED,
          customData: {
            sessionId: sessionId,
            eventCount: eventIds.length,
            eventIds: eventIds,
            queueLengthAfterFail: queueLength
          },
          originalError: e
        }),
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });

      throw e;
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
          let session = await this.sessionsService.getSessionByIdCheckExists({
            sessionId
          });

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

    return { needsSafePause };
  }
}
