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
import type { ProjectRemoteType } from '#common/types/backend/parts/project/project-remote-type';

import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';

export const projectsTable = pgTable(
  'projects',
  {
    projectId: varchar('project_id', { length: 32 }).notNull().primaryKey(),
    orgId: varchar('org_id', { length: 128 }).notNull(),
    remoteType: varchar('remote_type').$type<ProjectRemoteType>().notNull(),
    st: json('st')
      .$type<{ encrypted: string; decrypted: ProjectSt }>()
      .notNull(),
    lt: json('lt')
      .$type<{ encrypted: string; decrypted: ProjectLt }>()
      .notNull(),
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
