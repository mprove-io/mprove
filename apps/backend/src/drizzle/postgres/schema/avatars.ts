import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  varchar
} from 'drizzle-orm/pg-core';
import { AvatarLt, AvatarSt } from '~common/interfaces/st-lt';

export const avatarsTable = pgTable(
  'avatars',
  {
    userId: varchar('user_id', { length: 32 }).notNull().primaryKey(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: AvatarSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: AvatarLt }>()
      .notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxAvatarsServerTs: index('idx_avatars_server_ts').on(table.serverTs),
    idxAvatarsKeyTag: index('idx_avatars_key_tag').on(table.keyTag)
  })
);

export type AvatarEnt = InferSelectModel<typeof avatarsTable>;
export type AvatarEntIns = InferInsertModel<typeof avatarsTable>;
