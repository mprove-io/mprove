import { inArray, sql } from 'drizzle-orm';
import { notesTable } from '#backend/drizzle/postgres/tables/notes';
import type { DbService } from '#backend/services/db/db.service';

export async function removeNotes(item: { db: DbService }): Promise<void> {
  let { db } = item;

  let rawData: any = await db.drizzle.execute(sql`
SELECT
  n.note_id
FROM notes AS n
WHERE to_timestamp(n.server_ts/1000) < (NOW() - INTERVAL '2 days');
`);

  let noteIds: string[] = rawData.rows.map((x: any) => x.note_id) || [];

  if (noteIds.length > 0) {
    await db.drizzle
      .delete(notesTable)
      .where(inArray(notesTable.noteId, noteIds));
  }
}
