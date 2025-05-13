import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const avatarsTable = pgTable(
  'avatars',
  {
    userId: varchar('user_id', { length: 32 }).notNull().primaryKey(),
    avatarSmall: text('avatar_small'),
    avatarBig: text('avatar_big'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxAvatarsServerTs: index('idx_avatars_server_ts').on(table.serverTs)
  })
);

export type AvatarEnt = InferSelectModel<typeof avatarsTable>;
export type AvatarEntIns = InferInsertModel<typeof avatarsTable>;
