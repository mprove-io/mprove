import { Injectable } from '@nestjs/common';
import { inArray, sql } from 'drizzle-orm';
import { notesTable } from '#backend/drizzle/postgres/schema/notes';
import { DbService } from '#backend/services/db/db.service';

@Injectable()
export class NotesService {
  constructor(private db: DbService) {}

  async removeNotes() {
    let rawData: any = await this.db.drizzle.execute(sql`
SELECT
  n.note_id
FROM notes AS n
WHERE to_timestamp(n.server_ts/1000) < (NOW() - INTERVAL '2 days');
`);

    let noteIds: string[] = rawData.rows.map((x: any) => x.note_id) || [];

    if (noteIds.length > 0) {
      await this.db.drizzle
        .delete(notesTable)
        .where(inArray(notesTable.noteId, noteIds));
    }
  }
}
