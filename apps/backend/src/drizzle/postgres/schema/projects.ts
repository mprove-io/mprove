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
    name: text('name').notNull(), // name is unique across org projects
    defaultBranch: text('default_branch').default('main').notNull(),
    remoteType: varchar('remote_type')
      .default('Managed')
      .$type<ProjectRemoteTypeEnum>()
      .notNull(),
    gitUrl: varchar('git_url'),
    publicKey: text('public_key'),
    privateKey: text('private_key'),
    serverTs: bigint('server_ts', { mode: 'number' }).notNull()
  },
  table => ({
    idxProjectsOrgId: index('idx_projects_org_id').on(table.orgId),
    //
    uidxProjectsOrgIdName: uniqueIndex('uidx_projects_org_id_name').on(
      table.orgId,
      table.name
    )
  })
);

export type ProjectEnt = InferSelectModel<typeof projectsTable>;
export type ProjectEntIns = InferInsertModel<typeof projectsTable>;
