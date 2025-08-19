import * as avatars from '~backend/drizzle/postgres/schema/avatars';
import * as branches from '~backend/drizzle/postgres/schema/branches';
import * as bridges from '~backend/drizzle/postgres/schema/bridges';
import * as charts from '~backend/drizzle/postgres/schema/charts';
import * as connections from '~backend/drizzle/postgres/schema/connections';
import * as dashboards from '~backend/drizzle/postgres/schema/dashboards';
import * as envs from '~backend/drizzle/postgres/schema/envs';
import * as kits from '~backend/drizzle/postgres/schema/kits';
import * as mconfigs from '~backend/drizzle/postgres/schema/mconfigs';
import * as members from '~backend/drizzle/postgres/schema/members';
import * as models from '~backend/drizzle/postgres/schema/models';
import * as notes from '~backend/drizzle/postgres/schema/notes';
import * as orgs from '~backend/drizzle/postgres/schema/orgs';
import * as projects from '~backend/drizzle/postgres/schema/projects';
import * as queries from '~backend/drizzle/postgres/schema/queries';
import * as reports from '~backend/drizzle/postgres/schema/reports';
import * as structs from '~backend/drizzle/postgres/schema/structs';
import * as users from '~backend/drizzle/postgres/schema/users';

export const schemaPostgres = {
  ...avatars,
  ...branches,
  ...bridges,
  ...charts,
  ...connections,
  ...dashboards,
  ...envs,
  ...kits,
  ...mconfigs,
  ...members,
  ...models,
  ...notes,
  ...orgs,
  ...projects,
  ...queries,
  ...reports,
  ...structs,
  ...users
};

// import * as schemaPostgres from '~backend/drizzle/postgres/schema/_index';
// export { schemaPostgres };

// apps/backend/src/drizzle/postgres/schema/_index.ts

// export * from './avatars';
// export * from './branches';
// export * from './bridges';
// export * from './charts';
// export * from './connections';
// export * from './dashboards';
// export * from './envs';
// export * from './kits';
// export * from './mconfigs';
// export * from './members';
// export * from './models';
// export * from './notes';
// export * from './orgs';
// export * from './projects';
// export * from './queries';
// export * from './reports';
// export * from './structs';
// export * from './users';
