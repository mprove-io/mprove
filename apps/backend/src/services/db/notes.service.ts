import { Inject, Injectable } from '@nestjs/common';
import { inArray, sql } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { notesTable } from '~backend/drizzle/postgres/schema/notes';

@Injectable()
export class NotesService {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  async removeUnusedNotes() {
    let rawData: any = await this.db.drizzle.execute(sql`
SELECT
  n.note_id
FROM notes AS n
WHERE to_timestamp(n.server_ts/1000) < (NOW() - INTERVAL '2 days');
`);

    let unusedNoteIds: string[] = rawData.rows.map((x: any) => x.note_id) || [];

    if (unusedNoteIds.length > 0) {
      await this.db.drizzle
        .delete(notesTable)
        .where(inArray(notesTable.noteId, unusedNoteIds));
    }
  }
}
