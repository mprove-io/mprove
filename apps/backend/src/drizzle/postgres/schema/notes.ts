import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const notesTable = pgTable(
  'notes',
  {
    noteId: varchar('note_id', { length: 32 }).notNull().primaryKey(),
    st: text('st'),
    lt: text('lt'),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxNotesServerTs: index('idx_notes_server_ts').on(table.serverTs),
    idxNotesKeyTag: index('idx_notes_key_tag').on(table.keyTag)
  })
);

export type NoteEnt = InferSelectModel<typeof notesTable>;
export type NoteEntIns = InferInsertModel<typeof notesTable>;
