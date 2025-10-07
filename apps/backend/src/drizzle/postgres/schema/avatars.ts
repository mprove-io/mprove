import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, index, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { AvatarTab } from '~common/interfaces/backend/avatar-tab';

export const avatarsTable = pgTable(
  'avatars',
  {
    userId: varchar('user_id', { length: 32 }).notNull().primaryKey(),
    tab: text('tab'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxAvatarsServerTs: index('idx_avatars_server_ts').on(table.serverTs)
  })
);

export type AvatarEnt = InferSelectModel<typeof avatarsTable>;
export type AvatarEntIns = InferInsertModel<typeof avatarsTable>;

export interface AvatarEnx extends Omit<AvatarEnt, 'tab'> {
  tab: AvatarTab;
}
