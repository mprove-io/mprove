import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, asc, eq, gt } from 'drizzle-orm';
import { Observable } from 'rxjs';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events.js';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { RELOAD_SESSION_EVENT_TYPE } from '#common/constants/top';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { isDefined } from '#common/functions/is-defined';
import type { SessionEventApi } from '#common/interfaces/backend/session-event-api';
import { ServerError } from '#common/models/server-error';
import { TabService } from '../tab.service';

@Injectable()
export class SessionSseService {
  private POLL_INTERVAL_MS = 1000;

  constructor(
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  subscribeWithBackfill(item: {
    sessionId: string;
    lastEventIndex: number;
  }): Observable<SessionEventApi> {
    let { sessionId, lastEventIndex } = item;

    return new Observable<SessionEventApi>(observer => {
      let lastEmittedIndex = lastEventIndex;
      let lastReloadCheckTs = Date.now();
      let pollTimer: ReturnType<typeof setInterval> | undefined;
      let stopped = false;
      let isPolling = false;

      let pollDb = async () => {
        if (isPolling) {
          return;
        }
        isPolling = true;
        try {
          if (stopped) {
            return;
          }

          let eventEnts = await this.db.drizzle.query.ocEventsTable.findMany({
            where: and(
              eq(ocEventsTable.sessionId, sessionId),
              gt(ocEventsTable.eventIndex, lastEmittedIndex)
            ),
            orderBy: [asc(ocEventsTable.eventIndex)]
          });

          if (stopped) {
            return;
          }

          eventEnts.forEach(ent => {
            let tab = this.tabService.ocEventEntToTab(ent);
            let event: SessionEventApi = {
              eventId: tab.eventId,
              eventIndex: tab.eventIndex,
              eventType: tab.type,
              ocEvent: tab.ocEvent
            };
            observer.next(event);
            lastEmittedIndex = tab.eventIndex;
          });

          // Check reload flag on session
          let sessionRows = await this.db.drizzle
            .select({
              reloadRequestedTs: sessionsTable.reloadRequestedTs
            })
            .from(sessionsTable)
            .where(eq(sessionsTable.sessionId, sessionId));

          let reloadTs = sessionRows[0]?.reloadRequestedTs;

          let isReloadRequested =
            isDefined(reloadTs) && reloadTs > lastReloadCheckTs;

          if (isReloadRequested) {
            lastReloadCheckTs = reloadTs;

            observer.next({
              eventId: `${sessionId}_0`,
              eventIndex: 0,
              eventType: RELOAD_SESSION_EVENT_TYPE,
              ocEvent: {
                type: RELOAD_SESSION_EVENT_TYPE as any,
                properties: {}
              }
            });
          }
        } catch (err) {
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_AGENT_SSE_POLL_DB_FAILED,
              originalError: err
            }),
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        } finally {
          isPolling = false;
        }
      };

      // 1. Initial backfill from DB
      (async () => {
        try {
          await pollDb();

          if (stopped) {
            return;
          }

          // 2. Start polling timer after backfill
          pollTimer = setInterval(() => {
            pollDb();
          }, this.POLL_INTERVAL_MS);
        } catch (err) {
          observer.error(err);
        }
      })();

      return () => {
        stopped = true;
        if (pollTimer !== undefined) {
          clearInterval(pollTimer);
        }
      };
    });
  }
}
