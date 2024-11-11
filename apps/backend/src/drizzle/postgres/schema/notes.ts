/* eslint-disable id-blacklist */
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const notesTable = pgTable(
  'notes',
  {
    noteId: varchar('note_id', { length: 32 }).notNull().primaryKey(),
    publicKey: text('public_key').notNull(),
    privateKey: text('private_key').notNull(),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  }
  // ,
  // table => ({
  // })
);

export type NoteEnt = InferSelectModel<typeof notesTable>;
export type NoteEntIns = InferInsertModel<typeof notesTable>;
