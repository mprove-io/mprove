import * as avatars from '#backend/drizzle/postgres/schema/avatars';
import * as branches from '#backend/drizzle/postgres/schema/branches';
import * as bridges from '#backend/drizzle/postgres/schema/bridges';
import * as charts from '#backend/drizzle/postgres/schema/charts';
import * as connections from '#backend/drizzle/postgres/schema/connections';
import * as dashboards from '#backend/drizzle/postgres/schema/dashboards';
import * as dconfigs from '#backend/drizzle/postgres/schema/dconfigs';
import * as envs from '#backend/drizzle/postgres/schema/envs';
import * as events from '#backend/drizzle/postgres/schema/events';
import * as kits from '#backend/drizzle/postgres/schema/kits';
import * as mconfigs from '#backend/drizzle/postgres/schema/mconfigs';
import * as members from '#backend/drizzle/postgres/schema/members';
import * as messages from '#backend/drizzle/postgres/schema/messages';
import * as models from '#backend/drizzle/postgres/schema/models';
import * as notes from '#backend/drizzle/postgres/schema/notes';
import * as orgs from '#backend/drizzle/postgres/schema/orgs';
import * as parts from '#backend/drizzle/postgres/schema/parts';
import * as projects from '#backend/drizzle/postgres/schema/projects';
import * as queries from '#backend/drizzle/postgres/schema/queries';
import * as reports from '#backend/drizzle/postgres/schema/reports';
import * as sessions from '#backend/drizzle/postgres/schema/sessions';
import * as structs from '#backend/drizzle/postgres/schema/structs';
import * as users from '#backend/drizzle/postgres/schema/users';

export const schemaPostgres = {
  ...events,
  ...sessions,
  ...avatars,
  ...branches,
  ...bridges,
  ...charts,
  ...connections,
  ...dashboards,
  ...dconfigs,
  ...envs,
  ...kits,
  ...mconfigs,
  ...members,
  ...messages,
  ...models,
  ...notes,
  ...orgs,
  ...parts,
  ...projects,
  ...queries,
  ...reports,
  ...structs,
  ...users
};
