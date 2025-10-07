import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const avatarsTable = pgTable(
  'avatars',
  {
    userId: varchar('user_id', { length: 32 }).notNull().primaryKey(),
    st: text('st'),
    lt: text('lt'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxAvatarsServerTs: index('idx_avatars_server_ts').on(table.serverTs)
  })
);

export type AvatarEnt = InferSelectModel<typeof avatarsTable>;
export type AvatarEntIns = InferInsertModel<typeof avatarsTable>;
