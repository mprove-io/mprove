import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  json,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import type { RoleLt, RoleSt } from '#common/types/st-lt';

export const rolesTable = pgTable(
  'roles',
  {
    roleFullId: varchar('role_full_id', { length: 64 }).notNull().primaryKey(),
    projectId: varchar('project_id', { length: 32 }).notNull(),
    roleId: varchar('role_id', { length: 32 }).notNull(), // name
    st: json('st').$type<{ encrypted: string; decrypted: RoleSt }>().notNull(),
    lt: json('lt').$type<{ encrypted: string; decrypted: RoleLt }>().notNull(),
    keyTag: text('key_tag'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxRolesServerTs: index('idx_roles_server_ts').on(table.serverTs),
    idxRolesProjectId: index('idx_roles_project_id').on(table.projectId),
    idxRolesRoleId: index('idx_roles_role_id').on(table.roleId),
    idxRolesKeyTag: index('idx_roles_key_tag').on(table.keyTag),
    //
    uidxRolesProjectIdRoleId: uniqueIndex('uidx_roles_project_id_role_id').on(
      table.projectId,
      table.roleId
    )
  })
);

export type RoleEnt = InferSelectModel<typeof rolesTable>;
export type RoleEntIns = InferInsertModel<typeof rolesTable>;
