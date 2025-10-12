import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  bigint,
  index,
  pgTable,
  text,
  uniqueIndex,
  varchar
} from 'drizzle-orm/pg-core';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';

export const projectsTable = pgTable(
  'projects',
  {
    projectId: varchar('project_id', { length: 32 }).notNull().primaryKey(),
    orgId: varchar('org_id', { length: 128 }).notNull(),
    remoteType: varchar('remote_type').$type<ProjectRemoteTypeEnum>().notNull(),
    st: text('st'),
    lt: text('lt'),
    keyTag: text('key_tag'),
    nameHash: varchar('name_hash').notNull(), // name is unique across org projects
    gitUrlHash: varchar('git_url_hash'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxProjectsOrgId: index('idx_projects_org_id').on(table.orgId),
    idxProjectsNameHash: index('idx_projects_name_hash').on(table.nameHash),
    idxProjectsGitUrlHash: index('idx_projects_git_url_hash').on(
      table.gitUrlHash
    ),
    idxProjectsKeyTag: index('idx_projects_key_tag').on(table.keyTag),
    //
    uidxProjectsOrgIdNameHash: uniqueIndex('uidx_projects_org_id_name_hash').on(
      table.orgId,
      table.nameHash
    )
  })
);

export type ProjectEnt = InferSelectModel<typeof projectsTable>;
export type ProjectEntIns = InferInsertModel<typeof projectsTable>;
