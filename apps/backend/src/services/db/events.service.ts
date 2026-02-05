import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { EventEnt, eventsTable } from '#backend/drizzle/postgres/schema/events';

@Injectable()
export class EventsService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async getBySessionId(item: {
    sessionId: string;
    afterSequence?: number;
  }): Promise<EventEnt[]> {
    let conditions = [eq(eventsTable.sessionId, item.sessionId)];

    if (item.afterSequence !== undefined) {
      conditions.push(gt(eventsTable.sequence, item.afterSequence));
    }

    return this.db.drizzle.query.eventsTable.findMany({
      where: and(...conditions),
      orderBy: (table, { asc }) => [asc(table.sequence)]
    });
  }
}
